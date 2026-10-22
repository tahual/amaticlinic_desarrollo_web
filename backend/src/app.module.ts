import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './usuarios/usuario.entity';
import { Medico } from './medicos/medico.entity';
import { Paciente } from './pacientes/paciente.entity';
import { Horario } from './horarios/horario.entity';
import { Cita } from './citas/cita.entity';
import { HistorialMedico } from './historial/historial.entity';
import { Notificacion } from './notificaciones/notificacion.entity';
// [Farmacia] Entidades del modulo de farmacia
import { Medicamento } from './farmacia/entities/medicamento.entity';
import { Receta } from './farmacia/entities/receta.entity';
import { DetalleReceta } from './farmacia/entities/detalle-receta.entity';
import { MovimientoInventario } from './farmacia/entities/movimiento-inventario.entity';

import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MedicosModule } from './medicos/medicos.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { HorariosModule } from './horarios/horarios.module';
import { CitasModule } from './citas/citas.module';
import { HistorialModule } from './historial/historial.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { FarmaciaModule } from './farmacia/farmacia.module'; // [Farmacia]
// [Mejoras] Catalogos, seguros y pagina publica
import { Especialidad } from './catalogos/especialidad.entity';
import { Seguro } from './catalogos/seguro.entity';
import { CatalogosModule } from './catalogos/catalogos.module';
import { PublicoModule } from './publico/publico.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5432'), 10),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'postgres'),
        database: config.get('DB_DATABASE', 'citas_medicas'),
        entities: [
          Usuario, Medico, Paciente, Horario, Cita, HistorialMedico, Notificacion,
          Medicamento, Receta, DetalleReceta, MovimientoInventario, // [Farmacia]
          Especialidad, Seguro, // [Mejoras]
        ],
        // [Mejoras] La sesion de PostgreSQL usa la misma zona horaria que Node (America/Guatemala).
        // Sin esto, PostgreSQL en Docker trabaja en UTC y las fechas que genera la base (now(),
        // CreateDateColumn) quedaban 6 horas adelantadas respecto a las que genera el backend.
        extra: { options: `-c TimeZone=${config.get('DB_TIMEZONE', Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Guatemala')}` },
        // En desarrollo crea/actualiza las tablas automaticamente a partir de las entidades.
        // En produccion se recomienda usar migraciones (ver README) en lugar de synchronize.
        synchronize: config.get('DB_SYNCHRONIZE', 'true') === 'true',
      }),
    }),
    AuthModule,
    UsuariosModule,
    MedicosModule,
    PacientesModule,
    HorariosModule,
    CitasModule,
    HistorialModule,
    NotificacionesModule,
    EstadisticasModule,
    FarmaciaModule, // [Farmacia]
    CatalogosModule, // [Mejoras]
    PublicoModule,
  ],
})
export class AppModule {}
