import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class ApproveUserDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  companyId: string;

  @IsNotEmpty()
  @IsBoolean()
  approved: boolean;
}


