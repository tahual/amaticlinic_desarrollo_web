import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TipoUsuario, EstadoCita } from '../common/enums';

function toResponse(c: any) {
  return {
    id: c.id,
    idPaciente: c.paciente.id,
    nombrePaciente: `${c.paciente.usuario.nombre} ${c.paciente.usuario.apellido}`,
    idMedico: c.medico.id,
    nombreMedico: `${c.medico.usuario.nombre} ${c.medico.usuario.apellido}`,
    especialidad: c.medico.especialidad,
    consultorio: c.medico.consultorio,
    fecha: c.fecha,
    horaInicio: c.horaInicio,
    horaFin: c.horaFin,
    estado: c.estado,
    motivoConsulta: c.motivoConsulta,
  };
}

@Controller('api/citas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @Roles(TipoUsuario.Paciente, TipoUsuario.Recepcionista)
  async agendar(@Body() dto: CreateCitaDto) {
    return toResponse(await this.citasService.agendar(dto));
  }

  @Get()
  async listarTodas() {
    return (await this.citasService.listarTodas()).map(toResponse);
  }

  @Get('medico/:idMedico/fecha')
  async listarPorMedicoYFecha(@Param('idMedico', ParseIntPipe) idMedico: number, @Query('fecha') fecha: string) {
    return (await this.citasService.listarPorMedicoYFecha(idMedico, fecha)).map(toResponse);
  }

  @Get('medico/:idMedico')
  async listarPorMedico(@Param('idMedico', ParseIntPipe) idMedico: number) {
    return (await this.citasService.listarPorMedico(idMedico)).map(toResponse);
  }

  @Get('paciente/:idPaciente')
  async listarPorPaciente(@Param('idPaciente', ParseIntPipe) idPaciente: number) {
    return (await this.citasService.listarPorPaciente(idPaciente)).map(toResponse);
  }

  @Get(':id')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return toResponse(await this.citasService.obtener(id));
  }

  @Put(':id/cancelar')
  @Roles(TipoUsuario.Paciente, TipoUsuario.Medico, TipoUsuario.Recepcionista)
  async cancelar(@Param('id', ParseIntPipe) id: number) {
    return toResponse(await this.citasService.cambiarEstado(id, EstadoCita.Cancelada, 'Cancelada por el usuario'));
  }

  @Put(':id/completar')
  @Roles(TipoUsuario.Paciente, TipoUsuario.Medico, TipoUsuario.Recepcionista)
  async completar(@Param('id', ParseIntPipe) id: number) {
    return toResponse(await this.citasService.completar(id));
  }

  @Put(':id/reprogramar')
  @Roles(TipoUsuario.Paciente, TipoUsuario.Medico, TipoUsuario.Recepcionista)
  async reprogramar(
    @Param('id', ParseIntPipe) id: number,
    @Query('nuevoIdHorario', ParseIntPipe) nuevoIdHorario: number,
    @Query('nuevaFecha') nuevaFecha: string,
  ) {
    return toResponse(await this.citasService.reprogramar(id, nuevoIdHorario, nuevaFecha));
  }

  @Delete(':id')
  @Roles(TipoUsuario.Recepcionista)
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.citasService.eliminar(id);
    return;
  }
}
