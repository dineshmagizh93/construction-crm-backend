import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SiteProgressService } from './site-progress.service';
import { CreateSiteProgressDto } from './dto/create-site-progress.dto';
import { UpdateSiteProgressDto } from './dto/update-site-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('site-progress')
@UseGuards(JwtAuthGuard)
export class SiteProgressController {
  constructor(private readonly siteProgressService: SiteProgressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateSiteProgressDto, @CurrentUser() user: any) {
    return this.siteProgressService.create(createDto, user.companyId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @CurrentUser() user: any) {
    return this.siteProgressService.findAll(user.companyId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.siteProgressService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSiteProgressDto, @CurrentUser() user: any) {
    return this.siteProgressService.update(id, updateDto, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.siteProgressService.remove(id, user.companyId);
  }
}

