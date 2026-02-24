import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum DocumentType {
  AGREEMENT = 'Agreement',
  DRAWING = 'Drawing',
  BILL = 'Bill',
  INVOICE = 'Invoice',
  APPROVAL = 'Approval',
  OTHER = 'Other',
}

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @IsString()
  @IsOptional()
  fileName?: string;

  @IsNumber()
  @IsOptional()
  fileSize?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

