import {
  Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn,
} from 'typeorm';
import { Cita } from '../../citas/cita.entity';
import { Paciente } from '../../pacientes/paciente.entity';
import { Medico } from '../../medicos/medico.entity';
import { EstadoReceta } from '../../common/enums';
import { DetalleReceta } from './detalle-receta.entity';

// [Farmacia] Encabezado de la receta electronica emitida por el medico en una cita
@Entity({ name: 'receta', schema: 'citas_medicas' })
export class Receta {
  @PrimaryGeneratedColumn({ name: 'id_receta' })
  id: number;

  // Codigo legible que el paciente presenta en farmacia (ej. RX-7KQ2M9)
  @Column({ length: 20, unique: true })
  codigo: string;

  @ManyToOne(() => Cita, { eager: true })
  @JoinColumn({ name: 'id_cita' })
  cita: Cita;

  @ManyToOne(() => Paciente, { eager: true })
  @JoinColumn({ name: 'id_paciente' })
  paciente: Paciente;

  @ManyToOne(() => Medico, { eager: true })
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;

  @CreateDateColumn({ name: 'fecha_emision', type: 'timestamp' })
  fechaEmision: Date;

  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento: string;

  @Column({ type: 'enum', enum: EstadoReceta, default: EstadoReceta.Emitida })
  estado: EstadoReceta;

  @Column({ name: 'indicaciones_generales', type: 'text', nullable: true })
  indicacionesGenerales: string;

  @OneToMany(() => DetalleReceta, (d) => d.receta, { eager: true, cascade: true })
  detalles: DetalleReceta[];
}
