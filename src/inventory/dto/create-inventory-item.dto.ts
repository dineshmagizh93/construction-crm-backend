import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum InventoryCategory {
  MATERIAL = 'Material',
  TOOL = 'Tool',
  EQUIPMENT = 'Equipment',
  OTHER = 'Other',
}

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(InventoryCategory)
  @IsNotEmpty()
  category: InventoryCategory;

  @IsString()
  @IsNotEmpty()
  unit: string; // kg, pcs, m, etc.

  @IsNumber()
  @IsOptional()
  currentStock?: number;

  @IsNumber()
  @IsOptional()
  minStock?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

