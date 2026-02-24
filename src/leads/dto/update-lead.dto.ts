import { PartialType } from '@nestjs/mapped-types';
import { CreateLeadDto, LeadType, LeadSource, LeadStatus } from './create-lead.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateLeadDto extends PartialType(CreateLeadDto) {
  @IsEnum(LeadType)
  @IsOptional()
  type?: LeadType;

  @IsEnum(LeadSource)
  @IsOptional()
  source?: LeadSource;

  @IsEnum(LeadStatus)
  @IsOptional()
  status?: LeadStatus;
}

