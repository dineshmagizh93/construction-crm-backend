import { PartialType } from '@nestjs/mapped-types';
import { CreateLabourDto } from './create-labour.dto';

export class UpdateLabourDto extends PartialType(CreateLabourDto) {}

