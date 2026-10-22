import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

// [Farmacia] DTOs del catalogo e inventario de medicamentos

export class CreateMedicamentoDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Length(1, 100)
  nombre: string;

  @IsNotEmpty({ message: 'El principio activo es obligatorio' })
  @Length(1, 100)
  principioActivo: string;

  @IsNotEmpty({ message: 'La presentacion es obligatoria' })
  @Length(1, 50)
  presentacion: string;

  @IsOptional() @IsString() @Length(0, 50)
  concentracion?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0, { message: 'El stock inicial no puede ser negativo' })
  stock?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  stockMinimo?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0, { message: 'El precio no puede ser negativo' })
  precio?: number;

  @IsOptional() @IsBoolean()
  requiereReceta?: boolean;
}

// El stock NO se modifica por PUT: solo mediante entradas o ajustes (para que quede en el kardex)
export class UpdateMedicamentoDto {
  @IsOptional() @Length(1, 100)
  nombre?: string;

  @IsOptional() @Length(1, 100)
  principioActivo?: string;

  @IsOptional() @Length(1, 50)
  presentacion?: string;

  @IsOptional() @IsString() @Length(0, 50)
  concentracion?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  stockMinimo?: number;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0)
  precio?: number;

  @IsOptional() @IsBoolean()
  requiereReceta?: boolean;

  @IsOptional() @IsBoolean()
  activo?: boolean;
}

export class EntradaStockDto {
  @Type(() => Number) @IsInt() @Min(1, { message: 'La cantidad de entrada debe ser mayor a 0' })
  cantidad: number;

  @IsOptional() @IsString()
  motivo?: string;
}

export class AjusteStockDto {
  // Positivo suma, negativo resta (merma, vencimiento, conteo fisico)
  @Type(() => Number) @IsInt()
  cantidad: number;

  @IsNotEmpty({ message: 'El motivo del ajuste es obligatorio' })
  @IsString()
  motivo: string;
}
