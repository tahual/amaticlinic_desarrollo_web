import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './paciente.entity';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente) private repo: Repository<Paciente>,
    private usuariosService: UsuariosService,
  ) {}

  async crear(dto: CreatePacienteDto): Promise<Paciente> {
    const usuario = await this.usuariosService.obtener(dto.idUsuario);
    const paciente = this.repo.create({
      ...dto,
      usuario,
      // [Paciente] Si no se envian, se toman el telefono y correo de la cuenta de usuario
      telefono: dto.telefono || usuario.telefono,
      correo: dto.correo || usuario.correo,
    });
    return this.repo.save(paciente);
  }

  async obtener(id: number): Promise<Paciente> {
    const paciente = await this.repo.findOne({ where: { id } });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    return paciente;
  }

  buscarPorUsuario(idUsuario: number): Promise<Paciente | null> {
    return this.repo.findOne({ where: { usuario: { id: idUsuario } } });
  }

  listar(): Promise<Paciente[]> {
    return this.repo.find();
  }

  async actualizar(id: number, dto: UpdatePacienteDto): Promise<Paciente> {
    const paciente = await this.obtener(id);
    Object.keys(dto).forEach((key) => {
      if ((dto as any)[key] !== undefined) (paciente as any)[key] = (dto as any)[key];
    });
    return this.repo.save(paciente);
  }

  async eliminar(id: number): Promise<void> {
    const paciente = await this.obtener(id);
    await this.repo.remove(paciente);
  }
}
