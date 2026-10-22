import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';
import { EspecialidadDto, SeguroDto } from './dto/catalogos.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { TipoUsuario } from '../common/enums';
import { Especialidad } from './especialidad.entity';
import { Seguro } from './seguro.entity';

export function toEspecialidadResponse(e: Especialidad, medicos?: number) {
  return {
    id: e.id,
    nombre: e.nombre,
    descripcion: e.descripcion,
    precioConsulta: Number(e.precioConsulta),
    activo: e.activo,
    ...(medicos !== undefined ? { medicos } : {}),
  };
}

export function toSeguroResponse(s: Seguro, pacientes?: number) {
  return {
    id: s.id,
    nombre: s.nombre,
    descuentoConsulta: Number(s.descuentoConsulta),
    descuentoMedicamentos: Number(s.descuentoMedicamentos),
    telefono: s.telefono,
    activo: s.activo,
    ...(pacientes !== undefined ? { pacientes } : {}),
  };
}

// [Catalogo] Especialidades: la lista es publica (la usa la landing y el registro); editar es de recepcion
@Controller('api/especialidades')
export class EspecialidadesController {
  constructor(private readonly catalogos: CatalogosService) {}

  @Get()
  async listar(@Query('todas') todas?: string) {
    const [lista, conteo] = await Promise.all([
      this.catalogos.listarEspecialidades(todas === 'true'),
      this.catalogos.conteoMedicosPorEspecialidad(),
    ]);
    return lista.map((e) => toEspecialidadResponse(e, conteo.get(e.id) ?? 0));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.Recepcionista)
  async crear(@Body() dto: EspecialidadDto) {
    return toEspecialidadResponse(await this.catalogos.crearEspecialidad(dto));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.Recepcionista)
  async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: EspecialidadDto) {
    return toEspecialidadResponse(await this.catalogos.actualizarEspecialidad(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.Recepcionista)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.catalogos.eliminarEspecialidad(id);
  }
}

// [Seguros] Aseguradoras con convenio
@Controller('api/seguros')
export class SegurosController {
  constructor(private readonly catalogos: CatalogosService) {}

  @Get()
  async listar(@Query('todos') todos?: string) {
    const [lista, conteo] = await Promise.all([
      this.catalogos.listarSeguros(todos === 'true'),
      this.catalogos.conteoPacientesPorSeguro(),
    ]);
    return lista.map((s) => toSeguroResponse(s, conteo.get(s.id) ?? 0));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.Recepcionista)
  async crear(@Body() dto: SeguroDto) {
    return toSeguroResponse(await this.catalogos.crearSeguro(dto));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.Recepcionista)
  async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: SeguroDto) {
    return toSeguroResponse(await this.catalogos.actualizarSeguro(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.Recepcionista)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.catalogos.eliminarSeguro(id);
  }
}
