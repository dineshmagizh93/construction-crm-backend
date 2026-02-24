import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTaskPositionDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsNotEmpty()
  newStatus: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @Min(0)
  newPosition: number;
}

