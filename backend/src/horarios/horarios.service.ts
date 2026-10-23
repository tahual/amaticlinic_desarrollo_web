import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Horario } from './horario.entity';
import { Cita } from '../citas/cita.entity';
import { MedicosService } from '../medicos/medicos.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { DiaSemana, EstadoCita } from '../common/enums';

const DIA_SEMANA_JS: Record<number, DiaSemana> = {
  0: DiaSemana.Domingo,
  1: DiaSemana.Lunes,
  2: DiaSemana.Martes,
  3: DiaSemana.Miercoles,
  4: DiaSemana.Jueves,
  5: DiaSemana.Viernes,
  6: DiaSemana.Sabado,
};

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario) private repo: Repository<Horario>,
    @InjectRepository(Cita) private citaRepo: Repository<Cita>,
    private medicosService: MedicosService,
  ) {}

  // Crea un horario validando: (1) duplicado de dia para el mismo medico, (2) horaFin > horaInicio
  async crear(dto: CreateHorarioDto): Promise<Horario> {
    const medico = await this.medicosService.obtener(dto.idMedico);

    const existeHorario = await this.repo.findOne({
      where: { medico: { id: dto.idMedico }, diaSemana: dto.diaSemana },
    });
    if (existeHorario) {
      throw new ConflictException(
        `Ya existe un horario para este medico el dia ${dto.diaSemana}. Por favor, edita el horario existente o eliminalo primero.`,
      );
    }

    if (!(dto.horaFin > dto.horaInicio)) {
      throw new BadRequestException('La hora de fin debe ser mayor que la hora de inicio');
    }

    const horario = this.repo.create({
      medico,
      diaSemana: dto.diaSemana,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
    });
    return this.repo.save(horario);
  }

  listar(): Promise<Horario[]> {
    return this.repo.find();
  }

  async listarPorMedico(idMedico: number): Promise<Horario[]> {
    return this.repo.find({ where: { medico: { id: idMedico } } });
  }

  async obtener(id: number): Promise<Horario> {
    const horario = await this.repo.findOne({ where: { id } });
    if (!horario) throw new NotFoundException('Horario no encontrado');
    return horario;
  }

  // Calcula slots de 1 hora entre horaInicio y horaFin, marcando ocupado si ya hay una cita en esa hora
  async slotsDisponibles(idMedico: number, fecha: string) {
    const diaSemana = DIA_SEMANA_JS[new Date(fecha + 'T00:00:00').getDay()];

    const horarios = await this.repo.find({ where: { medico: { id: idMedico }, diaSemana } });
    if (horarios.length === 0) return [];

    const citasDelDia = await this.citaRepo.find({ where: { medico: { id: idMedico }, fecha } });

    const slots: { etiqueta: string; horaInicio: string; horaFin: string; ocupado: boolean }[] = [];

    for (const horario of horarios) {
      let actual = horario.horaInicio;
      while (actual < horario.horaFin) {
        const [h, m] = actual.split(':').map(Number);
        const finMinutos = h * 60 + m + 60;
        const finHora = String(Math.floor(finMinutos / 60)).padStart(2, '0');
        const finMin = String(finMinutos % 60).padStart(2, '0');
        const finSlot = `${finHora}:${finMin}`;

        const ocupado = citasDelDia.some((c) => c.horaInicio.slice(0, 5) === actual.slice(0, 5));

        slots.push({ etiqueta: actual.slice(0, 5), horaInicio: actual, horaFin: finSlot, ocupado });
        actual = finSlot;
      }
    }
    return slots;
  }

  // Actualiza validando duplicado de dia (si cambio) y rango de horas
  async actualizar(id: number, dto: UpdateHorarioDto): Promise<Horario> {
    const horario = await this.obtener(id);

    if (horario.diaSemana !== dto.diaSemana) {
      const existeOtro = await this.repo.findOne({
        where: { medico: { id: horario.medico.id }, diaSemana: dto.diaSemana },
      });
      if (existeOtro && existeOtro.id !== id) {
        throw new ConflictException(`Ya existe otro horario para este medico el dia ${dto.diaSemana}`);
      }
    }

    if (!(dto.horaFin > dto.horaInicio)) {
      throw new BadRequestException('La hora de fin debe ser mayor que la hora de inicio');
    }

    horario.diaSemana = dto.diaSemana;
    horario.horaInicio = dto.horaInicio;
    horario.horaFin = dto.horaFin;
    return this.repo.save(horario);
  }

  // Elimina solo si no hay citas futuras asociadas
  async eliminar(id: number): Promise<void> {
    const horario = await this.obtener(id);
    const hoy = new Date().toISOString().slice(0, 10);
    const citasFuturas = await this.citaRepo
      .createQueryBuilder('cita')
      .where('cita.id_horario = :id', { id })
      .andWhere('cita.fecha > :hoy', { hoy })
      .getCount();

    if (citasFuturas > 0) {
      throw new ConflictException(
        `No se puede eliminar este horario porque tiene ${citasFuturas} cita(s) programada(s). Por favor, cancela o reprograma las citas primero.`,
      );
    }
    await this.repo.remove(horario);
  }
}
