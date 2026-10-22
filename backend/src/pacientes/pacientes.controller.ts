import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TipoUsuario } from '../common/enums';

function toResponse(p: any) {
  return {
    id: p.id,
    idUsuario: p.usuario.id,
    nombre: p.usuario.nombre,
    apellido: p.usuario.apellido,
    telefono: p.telefono,
    correo: p.correo,
    documentoIdentidad: p.documentoIdentidad,
    fechaNacimiento: p.fechaNacimiento,
    direccion: p.direccion,
    tipoSangre: p.tipoSangre,
    alergias: p.alergias,
    contactoEmergenciaNombre: p.contactoEmergenciaNombre,
    contactoEmergenciaTelefono: p.contactoEmergenciaTelefono,
  };
}

@Controller('api/pacientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @Roles(TipoUsuario.Recepcionista)
  async crear(@Body() dto: CreatePacienteDto) {
    return toResponse(await this.pacientesService.crear(dto));
  }

  @Get()
  @Roles(TipoUsuario.Medico, TipoUsuario.Paciente, TipoUsuario.Recepcionista)
  async listar() {
    return (await this.pacientesService.listar()).map(toResponse);
  }

  @Get(':id')
  @Roles(TipoUsuario.Medico, TipoUsuario.Paciente, TipoUsuario.Recepcionista)
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return toResponse(await this.pacientesService.obtener(id));
  }

  @Put(':id')
  @Roles(TipoUsuario.Paciente, TipoUsuario.Recepcionista)
  async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePacienteDto) {
    return toResponse(await this.pacientesService.actualizar(id, dto));
  }

  @Delete(':id')
  @Roles(TipoUsuario.Recepcionista)
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.pacientesService.eliminar(id);
    return;
  }
}
