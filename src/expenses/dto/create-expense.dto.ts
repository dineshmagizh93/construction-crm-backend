import { IsString, IsNotEmpty, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum ExpenseCategory {
  MATERIAL = 'Material',
  LABOUR = 'Labour',
  TRANSPORT = 'Transport',
  EQUIPMENT = 'Equipment',
  OTHER = 'Other',
}

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsEnum(ExpenseCategory)
  @IsNotEmpty()
  category: ExpenseCategory;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  paidTo: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  attachment?: string;
}

