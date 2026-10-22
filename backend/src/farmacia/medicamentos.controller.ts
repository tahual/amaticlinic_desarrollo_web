import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { MedicamentosService } from './medicamentos.service';
import { AjusteStockDto, CreateMedicamentoDto, EntradaStockDto, UpdateMedicamentoDto } from './dto/medicamento.dto';
import { toMedicamentoResponse, toMovimientoResponse } from './farmacia.mappers';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TipoUsuario } from '../common/enums';

// [Farmacia] Catalogo e inventario de medicamentos
@Controller('api/medicamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicamentosController {
  constructor(private readonly service: MedicamentosService) {}

  // Rutas fijas antes de ':id' para que Express no las confunda con un id

  @Get()
  @Roles(TipoUsuario.Medico, TipoUsuario.Farmaceutico)
  async listar(@Query('buscar') buscar?: string, @Query('inactivos') inactivos?: string) {
    return (await this.service.listar(buscar, inactivos === 'true')).map(toMedicamentoResponse);
  }

  @Get('stock-bajo')
  @Roles(TipoUsuario.Farmaceutico)
  async stockBajo() {
    return (await this.service.stockBajo()).map(toMedicamentoResponse);
  }

  @Get('movimientos')
  @Roles(TipoUsuario.Farmaceutico)
  async movimientos(@Query('idMedicamento') idMedicamento?: string) {
    const id = idMedicamento ? Number(idMedicamento) : undefined;
    return (await this.service.movimientos(id)).map(toMovimientoResponse);
  }

  @Get(':id')
  @Roles(TipoUsuario.Medico, TipoUsuario.Farmaceutico)
  async obtener(@Param('id', ParseIntPipe) id: number) {
    return toMedicamentoResponse(await this.service.obtener(id));
  }

  @Post()
  @Roles(TipoUsuario.Farmaceutico)
  async crear(@Body() dto: CreateMedicamentoDto, @CurrentUser() user: any) {
    return toMedicamentoResponse(await this.service.crear(dto, user.correo));
  }

  @Put(':id')
  @Roles(TipoUsuario.Farmaceutico)
  async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMedicamentoDto) {
    return toMedicamentoResponse(await this.service.actualizar(id, dto));
  }

  @Post(':id/entrada')
  @Roles(TipoUsuario.Farmaceutico)
  async entrada(@Param('id', ParseIntPipe) id: number, @Body() dto: EntradaStockDto, @CurrentUser() user: any) {
    return toMedicamentoResponse(await this.service.registrarEntrada(id, dto, user.correo));
  }

  @Post(':id/ajuste')
  @Roles(TipoUsuario.Farmaceutico)
  async ajuste(@Param('id', ParseIntPipe) id: number, @Body() dto: AjusteStockDto, @CurrentUser() user: any) {
    return toMedicamentoResponse(await this.service.registrarAjuste(id, dto, user.correo));
  }

  // No borra: desactiva (el medicamento tiene recetas y kardex asociados)
  @Delete(':id')
  @Roles(TipoUsuario.Farmaceutico)
  async desactivar(@Param('id', ParseIntPipe) id: number) {
    return toMedicamentoResponse(await this.service.desactivar(id));
  }
}
