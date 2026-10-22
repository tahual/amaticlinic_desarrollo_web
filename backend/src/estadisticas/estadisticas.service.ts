import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cita } from '../citas/cita.entity';
import { Medico } from '../medicos/medico.entity';
import { EstadoCita } from '../common/enums';

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectRepository(Cita) private citaRepo: Repository<Cita>,
    @InjectRepository(Medico) private medicoRepo: Repository<Medico>,
  ) {}

  async paraPaciente(idPaciente: number) {
    const hoy = hoyISO();
    const inicioMes = hoy.slice(0, 8) + '01';
    const finMes = new Date(new Date(hoy).getFullYear(), new Date(hoy).getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const citas = await this.citaRepo.find({ where: { paciente: { id: idPaciente } } });

    const activas = citas.filter(
      (c) => (c.estado === EstadoCita.Agendada || c.estado === EstadoCita.Modificada) && c.fecha >= hoy,
    );
    const proxima = activas.sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
    const diasProximaCita = proxima
      ? Math.round((new Date(proxima.fecha).getTime() - new Date(hoy).getTime()) / 86400000)
      : 0;

    return {
      citasProgramadas: activas.length,
      diasProximaCita,
      medicosDisponibles: await this.medicoRepo.count(),
      citasEsteMes: citas.filter((c) => c.fecha >= inicioMes && c.fecha <= finMes).length,
      citasProximas: citas.filter((c) => c.fecha > hoy).length,
      citasConfirmadas: citas.filter((c) => c.estado === EstadoCita.Agendada || c.estado === EstadoCita.Modificada).length,
      citasPendientes: citas.filter((c) => c.estado === EstadoCita.Agendada && c.fecha >= hoy).length,
      citasPasadas: citas.filter((c) => c.fecha < hoy).length,
      citasTotales: citas.length,
    };
  }

  async paraMedico(idMedico: number) {
    const hoy = hoyISO();
    const inicioMes = hoy.slice(0, 8) + '01';
    const finMes = new Date(new Date(hoy).getFullYear(), new Date(hoy).getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const citas = await this.citaRepo.find({ where: { medico: { id: idMedico } } });

    const activas = citas.filter(
      (c) => (c.estado === EstadoCita.Agendada || c.estado === EstadoCita.Modificada) && c.fecha >= hoy,
    );
    const proxima = activas.sort((a, b) => a.fecha.localeCompare(b.fecha))[0];
    const diasProximaCita = proxima
      ? Math.round((new Date(proxima.fecha).getTime() - new Date(hoy).getTime()) / 86400000)
      : 0;

    return {
      citasProgramadas: activas.length,
      diasProximaCita,
      citasEsteMes: citas.filter((c) => c.fecha >= inicioMes && c.fecha <= finMes).length,
      citasTotales: citas.length,
    };
  }
}
