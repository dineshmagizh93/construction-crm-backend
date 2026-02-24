import { IsString, IsNotEmpty, IsDateString, IsOptional, IsArray } from 'class-validator';

export class CreateSiteProgressDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];
}

