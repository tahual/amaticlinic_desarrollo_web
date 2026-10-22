import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api/estadisticas')
@UseGuards(JwtAuthGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('paciente/:idPaciente')
  paraPaciente(@Param('idPaciente', ParseIntPipe) idPaciente: number) {
    return this.estadisticasService.paraPaciente(idPaciente);
  }

  @Get('medico/:idMedico')
  paraMedico(@Param('idMedico', ParseIntPipe) idMedico: number) {
    return this.estadisticasService.paraMedico(idMedico);
  }
}
