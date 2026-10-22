import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita } from './cita.entity';
import { Horario } from '../horarios/horario.entity';
import { PacientesService } from '../pacientes/pacientes.service';
import { MedicosService } from '../medicos/medicos.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { DiaSemana, EstadoCita, TipoNotificacion } from '../common/enums';

const DIA_SEMANA_JS: Record<number, DiaSemana> = {
  0: DiaSemana.Domingo,
  1: DiaSemana.Lunes,
  2: DiaSemana.Martes,
  3: DiaSemana.Miercoles,
  4: DiaSemana.Jueves,
  5: DiaSemana.Viernes,
  6: DiaSemana.Sabado,
};

const ACTIVOS = [EstadoCita.Agendada, EstadoCita.Modificada];

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita) private repo: Repository<Cita>,
    @InjectRepository(Horario) private horarioRepo: Repository<Horario>,
    private pacientesService: PacientesService,
    private medicosService: MedicosService,
    private notificacionesService: NotificacionesService,
  ) {}

  private diaSemanaDe(fecha: string): DiaSemana {
    return DIA_SEMANA_JS[new Date(fecha + 'T00:00:00').getDay()];
  }

  // Agenda una cita validando: existencia de entidades, pertenencia del horario al medico,
  // correspondencia dia/fecha y que no haya otra cita activa para ese medico+fecha+hora.
  async agendar(dto: CreateCitaDto): Promise<Cita> {
    const paciente = await this.pacientesService.obtener(dto.idPaciente);
    const medico = await this.medicosService.obtener(dto.idMedico);
    const horario = await this.horarioRepo.findOne({ where: { id: dto.idHorario } });
    if (!horario) throw new NotFoundException('Horario no encontrado');

    if (horario.medico.id !== medico.id) {
      throw new BadRequestException('El horario no pertenece al medico indicado');
    }

    const diaHorario = horario.diaSemana;
    if (this.diaSemanaDe(dto.fecha) !== diaHorario) {
      throw new BadRequestException(`La fecha no coincide con el dia del horario (${diaHorario})`);
    }

    const existeCita = await this.repo
      .createQueryBuilder('cita')
      .where('cita.id_medico = :idMedico', { idMedico: dto.idMedico })
      .andWhere('cita.fecha = :fecha', { fecha: dto.fecha })
      .andWhere('cita.hora_inicio = :horaInicio', { horaInicio: dto.horaInicio })
      .andWhere('cita.estado != :cancelada', { cancelada: EstadoCita.Cancelada })
      .getCount();

    if (existeCita > 0) {
      throw new ConflictException('Ya existe una cita en ese horario');
    }

    const cita = this.repo.create({
      paciente,
      medico,
      horario,
      fecha: dto.fecha,
      horaInicio: dto.horaInicio,
      horaFin: dto.horaFin,
      estado: EstadoCita.Agendada,
      motivoConsulta: dto.motivoConsulta,
    });
    const guardada = await this.repo.save(cita);

    await this.notificacionesService.enviar(guardada, TipoNotificacion.correo, `Cita agendada para ${dto.fecha}`);
    return guardada;
  }

  listarTodas(): Promise<Cita[]> {
    return this.repo.find();
  }

  async obtener(id: number): Promise<Cita> {
    const cita = await this.repo.findOne({ where: { id } });
    if (!cita) throw new NotFoundException('Cita no encontrada');
    return cita;
  }

  listarPorMedico(idMedico: number): Promise<Cita[]> {
    return this.repo.find({ where: { medico: { id: idMedico } } });
  }

  listarPorMedicoYFecha(idMedico: number, fecha: string): Promise<Cita[]> {
    return this.repo.find({ where: { medico: { id: idMedico }, fecha } });
  }

  listarPorPaciente(idPaciente: number): Promise<Cita[]> {
    return this.repo.find({ where: { paciente: { id: idPaciente } }, order: { fecha: 'DESC' } });
  }

  async cambiarEstado(id: number, nuevoEstado: EstadoCita, motivo?: string): Promise<Cita> {
    const cita = await this.obtener(id);
    cita.estado = nuevoEstado;
    const guardada = await this.repo.save(cita);

    if (nuevoEstado === EstadoCita.Cancelada) {
      await this.notificacionesService.enviar(
        guardada,
        TipoNotificacion.correo,
        `Cita cancelada. ${motivo ?? ''}`,
      );
    }
    return guardada;
  }

  async completar(id: number): Promise<Cita> {
    const cita = await this.obtener(id);
    cita.estado = EstadoCita.Completada;
    return this.repo.save(cita);
  }

  // Reprograma validando que el nuevo horario sea del mismo medico, coincida con la fecha
  // y no este ya ocupado.
  async reprogramar(id: number, nuevoIdHorario: number, nuevaFecha: string): Promise<Cita> {
    const cita = await this.obtener(id);
    const nuevoHorario = await this.horarioRepo.findOne({ where: { id: nuevoIdHorario } });
    if (!nuevoHorario) throw new NotFoundException('Horario no encontrado');

    if (nuevoHorario.medico.id !== cita.medico.id) {
      throw new BadRequestException('El nuevo horario no pertenece al mismo medico');
    }
    if (this.diaSemanaDe(nuevaFecha) !== nuevoHorario.diaSemana) {
      throw new BadRequestException('La nueva fecha no coincide con el dia del nuevo horario');
    }

    const ocupado = await this.repo
      .createQueryBuilder('cita')
      .where('cita.id_horario = :idHorario', { idHorario: nuevoIdHorario })
      .andWhere('cita.fecha = :fecha', { fecha: nuevaFecha })
      .andWhere('cita.estado IN (:...estados)', { estados: ACTIVOS })
      .getCount();

    if (ocupado > 0) {
      throw new ConflictException('El nuevo horario esta ocupado para esa fecha');
    }

    cita.horario = nuevoHorario;
    cita.fecha = nuevaFecha;
    cita.estado = EstadoCita.Modificada;
    const guardada = await this.repo.save(cita);

    await this.notificacionesService.enviar(guardada, TipoNotificacion.correo, `Cita reprogramada para ${nuevaFecha}`);
    return guardada;
  }

  async eliminar(id: number): Promise<void> {
    const cita = await this.obtener(id);
    await this.repo.remove(cita);
  }
}
