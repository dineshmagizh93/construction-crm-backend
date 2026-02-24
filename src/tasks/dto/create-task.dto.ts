import { IsString, IsOptional, IsDateString, IsEnum, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum TaskStatus {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
  BLOCKED = 'Blocked',
}

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

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
}

