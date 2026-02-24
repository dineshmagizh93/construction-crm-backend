import { IsString, IsEmail, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum LeadType {
  LEAD = 'LEAD',
  CLIENT = 'CLIENT',
}

export enum LeadSource {
  BROKER = 'Broker',
  PORTAL = 'Portal',
  REFERRAL = 'Referral',
  DIRECT = 'Direct',
}

export enum LeadStatus {
  NEW = 'New',
  CONTACTED = 'Contacted',
  QUALIFIED = 'Qualified',
  CONVERTED = 'Converted',
  LOST = 'Lost',
}

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(LeadType)
  @IsOptional()
  type?: LeadType;

  @IsEnum(LeadSource)
  source: LeadSource;

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

