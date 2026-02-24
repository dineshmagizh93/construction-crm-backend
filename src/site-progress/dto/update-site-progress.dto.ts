import { PartialType } from '@nestjs/mapped-types';
import { CreateSiteProgressDto } from './create-site-progress.dto';

export class UpdateSiteProgressDto extends PartialType(CreateSiteProgressDto) {}

