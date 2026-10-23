export type TipoUsuario = 'Paciente' | 'Medico' | 'Recepcionista';
export type EstadoCita = 'Agendada' | 'Cancelada' | 'Modificada' | 'Completada';
export type DiaSemana = 'Lunes' | 'Martes' | 'Miercoles' | 'Jueves' | 'Viernes' | 'Sabado' | 'Domingo';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: TipoUsuario;
  idPerfil: number | null;
  token: string;
}

export interface LoginResponse {
  token: string;
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: TipoUsuario;
  idPerfil: number | null;
}

export interface Medico {
  id: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  especialidad: string;
  consultorio: string;
  anosExperiencia: number;
  descripcion: string;
  rating: number;
}

export interface Paciente {
  id: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  documentoIdentidad: string;
  fechaNacimiento: string;
  direccion: string;
  tipoSangre: string;
  alergias: string;
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
}

export interface Horario {
  id: number;
  idMedico: number;
  nombreMedico: string;
  especialidad: string;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFin: string;
}

export interface SlotDisponible {
  etiqueta: string;
  horaInicio: string;
  horaFin: string;
  ocupado: boolean;
}

export interface Cita {
  id: number;
  idPaciente: number;
  nombrePaciente: string;
  idMedico: number;
  nombreMedico: string;
  especialidad: string;
  consultorio: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoCita;
  motivoConsulta: string;
}

export interface HistorialMedico {
  id: number;
  idPaciente: number;
  nombrePaciente: string;
  idMedico: number;
  nombreMedico: string;
  especialidad: string;
  diagnostico: string;
  tratamiento: string;
  fechaRegistro: string;
}

export interface Estadisticas {
  citasProgramadas: number;
  diasProximaCita: number;
  medicosDisponibles?: number;
  citasEsteMes: number;
  citasProximas?: number;
  citasConfirmadas?: number;
  citasPendientes?: number;
  citasPasadas?: number;
  citasTotales: number;
}
