import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

@Entity({ name: 'paciente', schema: 'citas_medicas' })
export class Paciente {
  @PrimaryGeneratedColumn({ name: 'id_paciente' })
  id: number;

  @OneToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ name: 'documento_identidad', length: 50, nullable: true })
  documentoIdentidad: string;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @Column({ length: 100, nullable: true })
  correo: string;

  @Column({ length: 150, nullable: true })
  direccion: string;

  @Column({ name: 'tipo_sangre', length: 10, nullable: true })
  tipoSangre: string;

  @Column({ type: 'text', nullable: true })
  alergias: string;

  @Column({ name: 'contacto_emergencia_nombre', length: 100, nullable: true })
  contactoEmergenciaNombre: string;

  @Column({ name: 'contacto_emergencia_telefono', length: 20, nullable: true })
  contactoEmergenciaTelefono: string;
}
