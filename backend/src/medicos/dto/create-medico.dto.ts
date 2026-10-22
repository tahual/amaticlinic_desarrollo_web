import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

// Equivalente a MedicoCreateRequest: crea Usuario + Medico en una sola operacion
export class CreateMedicoDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @IsEmail({}, { message: 'Debe ser un correo valido' })
  correo: string;

  @IsOptional() @IsString()
  telefono?: string;

  @IsNotEmpty({ message: 'La especialidad es obligatoria' })
  @Length(1, 50)
  especialidad: string;

  @IsOptional() @IsString() @Length(0, 50)
  consultorio?: string;

  @IsOptional() @IsInt() @Min(0)
  anosExperiencia?: number;

  @IsOptional() @IsString()
  descripcion?: string;

  @IsOptional() @IsString()
  password?: string;
}
