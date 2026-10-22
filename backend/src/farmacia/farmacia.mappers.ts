import { Medicamento } from './entities/medicamento.entity';
import { Receta } from './entities/receta.entity';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { fechaLocal } from './farmacia.utils';

// [Farmacia] Formas de respuesta (DTO de salida) de la API de farmacia

export function toMedicamentoResponse(m: Medicamento) {
  return {
    id: m.id,
    nombre: m.nombre,
    principioActivo: m.principioActivo,
    presentacion: m.presentacion,
    concentracion: m.concentracion,
    stock: m.stock,
    stockMinimo: m.stockMinimo,
    stockBajo: m.stock <= m.stockMinimo,
    precio: Number(m.precio),
    requiereReceta: m.requiereReceta,
    activo: m.activo,
  };
}

export function toRecetaResponse(r: Receta) {
  return {
    id: r.id,
    codigo: r.codigo,
    idCita: r.cita?.id,
    fechaCita: r.cita?.fecha,
    idPaciente: r.paciente.id,
    nombrePaciente: `${r.paciente.usuario.nombre} ${r.paciente.usuario.apellido}`,
    alergiasPaciente: r.paciente.alergias || null,
    idMedico: r.medico.id,
    nombreMedico: `${r.medico.usuario.nombre} ${r.medico.usuario.apellido}`,
    especialidad: r.medico.especialidad,
    fechaEmision: r.fechaEmision,
    fechaVencimiento: r.fechaVencimiento,
    vencida: r.fechaVencimiento < fechaLocal() && r.estado !== 'Despachada' && r.estado !== 'Anulada',
    estado: r.estado,
    indicacionesGenerales: r.indicacionesGenerales,
    detalles: (r.detalles || [])
      .sort((a, b) => a.id - b.id)
      .map((d) => ({
        id: d.id,
        idMedicamento: d.medicamento.id,
        medicamento: d.medicamento.nombre,
        principioActivo: d.medicamento.principioActivo,
        presentacion: d.medicamento.presentacion,
        concentracion: d.medicamento.concentracion,
        stockDisponible: d.medicamento.stock,
        dosis: d.dosis,
        frecuencia: d.frecuencia,
        duracionDias: d.duracionDias,
        cantidad: d.cantidad,
        cantidadDespachada: d.cantidadDespachada,
        pendiente: d.cantidad - d.cantidadDespachada,
        indicaciones: d.indicaciones,
      })),
  };
}

export function toMovimientoResponse(m: MovimientoInventario) {
  return {
    id: m.id,
    fecha: m.fecha,
    tipo: m.tipo,
    idMedicamento: m.medicamento?.id,
    medicamento: m.medicamento?.nombre,
    cantidad: m.cantidad,
    stockResultante: m.stockResultante,
    motivo: m.motivo,
    codigoReceta: m.receta?.codigo ?? null,
    usuario: m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido}` : null,
  };
}
