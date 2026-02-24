import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum VendorType {
  MATERIAL_SUPPLIER = 'Material Supplier',
  SUBCONTRACTOR = 'Subcontractor',
  EQUIPMENT_RENTAL = 'Equipment Rental',
  CONSULTANT = 'Consultant',
  OTHER = 'Other',
}

export enum VendorStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(VendorType)
  @IsNotEmpty()
  type: VendorType;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;
}

