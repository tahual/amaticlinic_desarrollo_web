import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  Cita, Estadisticas, Horario, HistorialMedico, Medico, Paciente, SlotDisponible,
} from '../models/models';

const BASE = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // ---------- Medicos ----------
  listarMedicos() {
    return this.http.get<Medico[]>(`${BASE}/medicos`);
  }
  buscarMedicos(query?: string, especialidad?: string) {
    let params: any = {};
    if (query) params.query = query;
    if (especialidad) params.especialidad = especialidad;
    return this.http.get<Medico[]>(`${BASE}/medicos/buscar`, { params });
  }
  obtenerMedico(id: number) {
    return this.http.get<Medico>(`${BASE}/medicos/${id}`);
  }
  crearMedico(data: any) {
    return this.http.post<Medico>(`${BASE}/medicos`, data);
  }
  actualizarMedico(id: number, data: any) {
    return this.http.put<Medico>(`${BASE}/medicos/${id}`, data);
  }
  eliminarMedico(id: number) {
    return this.http.delete<void>(`${BASE}/medicos/${id}`);
  }

  // ---------- Pacientes ----------
  listarPacientes() {
    return this.http.get<Paciente[]>(`${BASE}/pacientes`);
  }
  obtenerPaciente(id: number) {
    return this.http.get<Paciente>(`${BASE}/pacientes/${id}`);
  }
  crearPaciente(data: any) {
    return this.http.post<Paciente>(`${BASE}/pacientes`, data);
  }
  actualizarPaciente(id: number, data: any) {
    return this.http.put<Paciente>(`${BASE}/pacientes/${id}`, data);
  }
  eliminarPaciente(id: number) {
    return this.http.delete<void>(`${BASE}/pacientes/${id}`);
  }

  // ---------- Horarios ----------
  listarHorarios() {
    return this.http.get<Horario[]>(`${BASE}/horarios`);
  }
  listarHorariosPorMedico(idMedico: number) {
    return this.http.get<Horario[]>(`${BASE}/horarios/medico/${idMedico}`);
  }
  slotsDisponibles(idMedico: number, fecha: string) {
    return this.http.get<SlotDisponible[]>(`${BASE}/horarios/slots-disponibles`, {
      params: { idMedico, fecha },
    });
  }
  crearHorario(data: any) {
    return this.http.post<Horario>(`${BASE}/horarios`, data);
  }
  actualizarHorario(id: number, data: any) {
    return this.http.put<Horario>(`${BASE}/horarios/${id}`, data);
  }
  eliminarHorario(id: number) {
    return this.http.delete<void>(`${BASE}/horarios/${id}`);
  }

  // ---------- Citas ----------
  listarCitas() {
    return this.http.get<Cita[]>(`${BASE}/citas`);
  }
  obtenerCita(id: number) {
    return this.http.get<Cita>(`${BASE}/citas/${id}`);
  }
  listarCitasPorMedico(idMedico: number) {
    return this.http.get<Cita[]>(`${BASE}/citas/medico/${idMedico}`);
  }
  listarCitasPorMedicoYFecha(idMedico: number, fecha: string) {
    return this.http.get<Cita[]>(`${BASE}/citas/medico/${idMedico}/fecha`, { params: { fecha } });
  }
  listarCitasPorPaciente(idPaciente: number) {
    return this.http.get<Cita[]>(`${BASE}/citas/paciente/${idPaciente}`);
  }
  agendarCita(data: any) {
    return this.http.post<Cita>(`${BASE}/citas`, data);
  }
  cancelarCita(id: number) {
    return this.http.put<Cita>(`${BASE}/citas/${id}/cancelar`, {});
  }
  completarCita(id: number) {
    return this.http.put<Cita>(`${BASE}/citas/${id}/completar`, {});
  }
  reprogramarCita(id: number, nuevoIdHorario: number, nuevaFecha: string) {
    return this.http.put<Cita>(`${BASE}/citas/${id}/reprogramar`, null, {
      params: { nuevoIdHorario, nuevaFecha },
    });
  }
  eliminarCita(id: number) {
    return this.http.delete<void>(`${BASE}/citas/${id}`);
  }

  // ---------- Historial medico ----------
  listarHistorial() {
    return this.http.get<HistorialMedico[]>(`${BASE}/historial`);
  }
  listarHistorialPorPaciente(idPaciente: number) {
    return this.http.get<HistorialMedico[]>(`${BASE}/historial/paciente/${idPaciente}`);
  }
  crearHistorial(data: any) {
    return this.http.post<HistorialMedico>(`${BASE}/historial`, data);
  }
  actualizarHistorial(id: number, data: any) {
    return this.http.put<HistorialMedico>(`${BASE}/historial/${id}`, data);
  }

  // ---------- Estadisticas ----------
  estadisticasPaciente(idPaciente: number) {
    return this.http.get<Estadisticas>(`${BASE}/estadisticas/paciente/${idPaciente}`);
  }
  estadisticasMedico(idMedico: number) {
    return this.http.get<Estadisticas>(`${BASE}/estadisticas/medico/${idMedico}`);
  }
}
