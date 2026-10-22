import {
  BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Medicamento } from './entities/medicamento.entity';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { AjusteStockDto, CreateMedicamentoDto, EntradaStockDto, UpdateMedicamentoDto } from './dto/medicamento.dto';
import { TipoMovimiento } from '../common/enums';

// [Farmacia] Catalogo de medicamentos e inventario. Toda variacion de stock pasa por aqui y deja
// un registro en el kardex (movimiento_inventario) con el usuario responsable.
@Injectable()
export class MedicamentosService {
  constructor(
    @InjectRepository(Medicamento) private repo: Repository<Medicamento>,
    @InjectRepository(MovimientoInventario) private movRepo: Repository<MovimientoInventario>,
    @InjectRepository(Usuario) private usuarioRepo: Repository<Usuario>,
    private dataSource: DataSource,
  ) {}

  private async usuarioActual(correo: string): Promise<Usuario> {
    const usuario = await this.usuarioRepo.findOne({ where: { correo } });
    if (!usuario) throw new UnauthorizedException('Usuario de la sesion no encontrado');
    return usuario;
  }

  listar(buscar?: string, incluirInactivos = false): Promise<Medicamento[]> {
    const qb = this.repo.createQueryBuilder('m').orderBy('m.nombre', 'ASC');
    if (!incluirInactivos) qb.andWhere('m.activo = true');
    if (buscar?.trim()) {
      qb.andWhere('(LOWER(m.nombre) LIKE :q OR LOWER(m.principioActivo) LIKE :q)', {
        q: `%${buscar.trim().toLowerCase()}%`,
      });
    }
    return qb.getMany();
  }

  async obtener(id: number): Promise<Medicamento> {
    const med = await this.repo.findOne({ where: { id } });
    if (!med) throw new NotFoundException('Medicamento no encontrado');
    return med;
  }

  stockBajo(): Promise<Medicamento[]> {
    return this.repo
      .createQueryBuilder('m')
      .where('m.activo = true')
      .andWhere('m.stock <= m.stockMinimo')
      .orderBy('m.stock', 'ASC')
      .getMany();
  }

  // Regla: no puede haber dos medicamentos activos con el mismo nombre, presentacion y concentracion
  private async validarDuplicado(nombre: string, presentacion: string, concentracion: string | undefined, excluirId?: number) {
    const qb = this.repo
      .createQueryBuilder('m')
      .where('m.activo = true')
      .andWhere('LOWER(m.nombre) = :n', { n: nombre.trim().toLowerCase() })
      .andWhere('LOWER(m.presentacion) = :p', { p: presentacion.trim().toLowerCase() })
      .andWhere("LOWER(COALESCE(m.concentracion, '')) = :c", { c: (concentracion ?? '').trim().toLowerCase() });
    if (excluirId) qb.andWhere('m.id <> :id', { id: excluirId });
    if (await qb.getCount()) {
      throw new ConflictException(`Ya existe el medicamento ${nombre} ${presentacion} ${concentracion ?? ''}`.trim());
    }
  }

  async crear(dto: CreateMedicamentoDto, correo: string): Promise<Medicamento> {
    await this.validarDuplicado(dto.nombre, dto.presentacion, dto.concentracion);
    const usuario = await this.usuarioActual(correo);

    return this.dataSource.transaction(async (manager) => {
      const med = await manager.save(
        manager.create(Medicamento, {
          nombre: dto.nombre.trim(),
          principioActivo: dto.principioActivo.trim(),
          presentacion: dto.presentacion.trim(),
          concentracion: dto.concentracion?.trim(),
          stock: dto.stock ?? 0,
          stockMinimo: dto.stockMinimo ?? 10,
          precio: dto.precio ?? 0,
          requiereReceta: dto.requiereReceta ?? true,
        }),
      );
      // El stock inicial tambien queda en el kardex
      if (med.stock > 0) {
        await manager.save(
          manager.create(MovimientoInventario, {
            medicamento: med, tipo: TipoMovimiento.Entrada, cantidad: med.stock,
            stockResultante: med.stock, motivo: 'Stock inicial', usuario,
          }),
        );
      }
      return med;
    });
  }

  async actualizar(id: number, dto: UpdateMedicamentoDto): Promise<Medicamento> {
    const med = await this.obtener(id);
    const nombre = dto.nombre ?? med.nombre;
    const presentacion = dto.presentacion ?? med.presentacion;
    const concentracion = dto.concentracion ?? med.concentracion;
    if (dto.activo !== false) await this.validarDuplicado(nombre, presentacion, concentracion, id);

    Object.entries(dto).forEach(([k, v]) => {
      if (v !== undefined) (med as any)[k] = typeof v === 'string' ? v.trim() : v;
    });
    return this.repo.save(med);
  }

  // Los medicamentos tienen recetas y kardex asociados: se desactivan en lugar de borrarse
  async desactivar(id: number): Promise<Medicamento> {
    const med = await this.obtener(id);
    med.activo = false;
    return this.repo.save(med);
  }

  async registrarEntrada(id: number, dto: EntradaStockDto, correo: string): Promise<Medicamento> {
    const usuario = await this.usuarioActual(correo);
    return this.dataSource.transaction(async (manager) => {
      // Bloqueo de fila: evita que una entrada y un despacho simultaneos pisen el stock
      const med = await manager.findOne(Medicamento, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!med) throw new NotFoundException('Medicamento no encontrado');
      if (!med.activo) throw new BadRequestException('No se puede ingresar stock a un medicamento desactivado');

      med.stock += dto.cantidad;
      await manager.save(med);
      await manager.save(
        manager.create(MovimientoInventario, {
          medicamento: med, tipo: TipoMovimiento.Entrada, cantidad: dto.cantidad,
          stockResultante: med.stock, motivo: dto.motivo?.trim() || 'Ingreso de mercaderia', usuario,
        }),
      );
      return med;
    });
  }

  async registrarAjuste(id: number, dto: AjusteStockDto, correo: string): Promise<Medicamento> {
    if (dto.cantidad === 0) throw new BadRequestException('El ajuste debe ser distinto de 0');
    const usuario = await this.usuarioActual(correo);
    return this.dataSource.transaction(async (manager) => {
      const med = await manager.findOne(Medicamento, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!med) throw new NotFoundException('Medicamento no encontrado');
      if (med.stock + dto.cantidad < 0) {
        throw new BadRequestException(`El ajuste dejaria el stock en negativo (stock actual: ${med.stock})`);
      }
      med.stock += dto.cantidad;
      await manager.save(med);
      await manager.save(
        manager.create(MovimientoInventario, {
          medicamento: med, tipo: TipoMovimiento.Ajuste, cantidad: dto.cantidad,
          stockResultante: med.stock, motivo: dto.motivo.trim(), usuario,
        }),
      );
      return med;
    });
  }

  movimientos(idMedicamento?: number): Promise<MovimientoInventario[]> {
    // QueryBuilder para traer solo el codigo de la receta (y no todas sus relaciones eager)
    const qb = this.movRepo
      .createQueryBuilder('mov')
      .leftJoinAndSelect('mov.medicamento', 'med')
      .leftJoinAndSelect('mov.usuario', 'u')
      .leftJoin('mov.receta', 'r')
      .addSelect(['r.id', 'r.codigo'])
      .orderBy('mov.fecha', 'DESC')
      .addOrderBy('mov.id', 'DESC')
      .limit(300);
    if (idMedicamento) qb.where('med.id = :id', { id: idMedicamento });
    return qb.getMany();
  }
}
