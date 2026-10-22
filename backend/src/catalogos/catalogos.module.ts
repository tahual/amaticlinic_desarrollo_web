import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Especialidad } from './especialidad.entity';
import { Seguro } from './seguro.entity';
import { Medico } from '../medicos/medico.entity';
import { Paciente } from '../pacientes/paciente.entity';
import { CatalogosService } from './catalogos.service';
import { EspecialidadesController, SegurosController } from './catalogos.controller';

// [Catalogo] [Seguros] Global para que citas y pacientes usen los precios
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Especialidad, Seguro, Medico, Paciente])],
  controllers: [EspecialidadesController, SegurosController],
  providers: [CatalogosService],
  exports: [CatalogosService],
})
export class CatalogosModule {}
