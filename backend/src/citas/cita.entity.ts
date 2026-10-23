import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Paciente } from '../pacientes/paciente.entity';
import { Medico } from '../medicos/medico.entity';
import { Horario } from '../horarios/horario.entity';
import { EstadoCita } from '../common/enums';

@Entity({ name: 'cita', schema: 'citas_medicas' })
export class Cita {
  @PrimaryGeneratedColumn({ name: 'id_cita' })
  id: number;

  @ManyToOne(() => Paciente, { eager: true })
  @JoinColumn({ name: 'id_paciente' })
  paciente: Paciente;

  @ManyToOne(() => Medico, { eager: true })
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;

  @ManyToOne(() => Horario, { eager: true })
  @JoinColumn({ name: 'id_horario' })
  horario: Horario;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ name: 'hora_inicio', type: 'time' })
  horaInicio: string;

  @Column({ name: 'hora_fin', type: 'time' })
  horaFin: string;

  @Column({ type: 'enum', enum: EstadoCita, default: EstadoCita.Agendada })
  estado: EstadoCita;

  @Column({ name: 'motivo_consulta', type: 'text', nullable: true })
  motivoConsulta: string;
}
