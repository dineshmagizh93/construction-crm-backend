import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';

export enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export class CreateInventoryTransactionDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  reference?: string; // PO Number, Invoice, etc.

  @IsString()
  @IsOptional()
  notes?: string;

  @IsDateString()
  @IsOptional()
  transactionDate?: string;
}

