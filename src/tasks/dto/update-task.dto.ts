import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskPriority, TaskStatus } from './create-task.dto';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  position?: number;

  @IsString()
  @IsOptional()
  labels?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  estimatedHours?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  actualHours?: number;
}

