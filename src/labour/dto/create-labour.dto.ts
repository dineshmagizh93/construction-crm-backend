import { IsString, IsNotEmpty, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum LabourCategory {
  MASON = 'Mason',
  HELPER = 'Helper',
  CARPENTER = 'Carpenter',
  ELECTRICIAN = 'Electrician',
  PLUMBER = 'Plumber',
  PAINTER = 'Painter',
  OTHER = 'Other',
}

export class CreateLabourDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsEnum(LabourCategory)
  @IsNotEmpty()
  category: LabourCategory;

  @IsNumber()
  @IsNotEmpty()
  headcount: number;

  @IsNumber()
  @IsNotEmpty()
  costPerDay: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

