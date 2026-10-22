// [Farmacia] se agrega el rol Farmaceutico
export type TipoUsuario = 'Paciente' | 'Medico' | 'Recepcionista' | 'Farmaceutico';
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

// ================================================================
// [Farmacia] Modelos del modulo de farmacia
// ================================================================
export type EstadoReceta = 'Emitida' | 'Parcial' | 'Despachada' | 'Anulada';
export type TipoMovimiento = 'Entrada' | 'Salida' | 'Ajuste';

export interface Medicamento {
  id: number;
  nombre: string;
  principioActivo: string;
  presentacion: string;
  concentracion: string | null;
  stock: number;
  stockMinimo: number;
  stockBajo: boolean;
  precio: number;
  requiereReceta: boolean;
  activo: boolean;
}

export interface DetalleReceta {
  id: number;
  idMedicamento: number;
  medicamento: string;
  principioActivo: string;
  presentacion: string;
  concentracion: string | null;
  stockDisponible: number;
  dosis: string;
  frecuencia: string;
  duracionDias: number;
  cantidad: number;
  cantidadDespachada: number;
  pendiente: number;
  indicaciones: string | null;
}

export interface Receta {
  id: number;
  codigo: string;
  idCita: number;
  fechaCita: string;
  idPaciente: number;
  nombrePaciente: string;
  alergiasPaciente: string | null;
  idMedico: number;
  nombreMedico: string;
  especialidad: string;
  fechaEmision: string;
  fechaVencimiento: string;
  vencida: boolean;
  estado: EstadoReceta;
  indicacionesGenerales: string | null;
  detalles: DetalleReceta[];
}

export interface AlertaAlergia {
  idMedicamento: number;
  medicamento: string;
  principioActivo: string;
  alergeno: string;
}

export interface ResultadoDespacho {
  receta: Receta;
  entregados: { medicamento: string; cantidad: number }[];
  faltantes: { medicamento: string; cantidad: number }[];
  alertasStock: { medicamento: string; stock: number; stockMinimo: number }[];
}

export interface MovimientoInventario {
  id: number;
  fecha: string;
  tipo: TipoMovimiento;
  idMedicamento: number;
  medicamento: string;
  cantidad: number;
  stockResultante: number;
  motivo: string | null;
  codigoReceta: string | null;
  usuario: string | null;
}

export interface ResumenFarmacia {
  medicamentosActivos: number;
  medicamentosStockBajo: number;
  recetasPendientes: number;
  recetasDespachadasHoy: number;
  unidadesDespachadasHoy: number;
  masDespachados30Dias: { medicamento: string; unidades: number }[];
}
