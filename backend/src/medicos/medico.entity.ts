import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity({ name: 'medico', schema: 'citas_medicas' })
export class Medico {
  @PrimaryGeneratedColumn({ name: 'id_medico' })
  id: number;

  @OneToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ length: 50 })
  especialidad: string;

  @Column({ name: 'anos_experiencia', type: 'int', nullable: true, default: 0 })
  anosExperiencia: number;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 50, nullable: true })
  consultorio: string;

  @Column({ type: 'numeric', precision: 3, scale: 2, default: 0 })
  rating: number;
}
