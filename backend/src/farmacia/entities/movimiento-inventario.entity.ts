import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Medicamento } from './medicamento.entity';
import { Receta } from './receta.entity';
import { Usuario } from '../../usuarios/usuario.entity';
import { TipoMovimiento } from '../../common/enums';

// [Farmacia] Kardex: cada entrada, salida o ajuste de inventario queda registrado con su responsable
@Entity({ name: 'movimiento_inventario', schema: 'citas_medicas' })
export class MovimientoInventario {
  @PrimaryGeneratedColumn({ name: 'id_movimiento' })
  id: number;

  @ManyToOne(() => Medicamento, { eager: true })
  @JoinColumn({ name: 'id_medicamento' })
  medicamento: Medicamento;

  @Column({ type: 'enum', enum: TipoMovimiento })
  tipo: TipoMovimiento;

  // Positiva en entradas, negativa en salidas; en ajustes puede ser cualquiera
  @Column({ type: 'int' })
  cantidad: number;

  @Column({ name: 'stock_resultante', type: 'int' })
  stockResultante: number;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  // Solo en salidas por despacho
  @ManyToOne(() => Receta, { nullable: true })
  @JoinColumn({ name: 'id_receta' })
  receta: Receta;

  @ManyToOne(() => Usuario, { eager: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;
}
