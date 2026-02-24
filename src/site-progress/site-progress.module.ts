import { Module } from '@nestjs/common';
import { SiteProgressService } from './site-progress.service';
import { SiteProgressController } from './site-progress.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SiteProgressController],
  providers: [SiteProgressService],
  exports: [SiteProgressService],
})
export class SiteProgressModule {}

