import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from '../citas/cita.entity';
import { Medico } from '../medicos/medico.entity';
import { EstadisticasService } from './estadisticas.service';
import { EstadisticasController } from './estadisticas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cita, Medico])],
  controllers: [EstadisticasController],
  providers: [EstadisticasService],
})
export class EstadisticasModule {}
