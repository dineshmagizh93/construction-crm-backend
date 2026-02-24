import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LabourService } from './labour.service';
import { CreateLabourDto } from './dto/create-labour.dto';
import { UpdateLabourDto } from './dto/update-labour.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('labour')
@UseGuards(JwtAuthGuard)
export class LabourController {
  constructor(private readonly labourService: LabourService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLabourDto: CreateLabourDto, @CurrentUser() user: any) {
    return this.labourService.create(createLabourDto, user.companyId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @CurrentUser() user: any) {
    return this.labourService.findAll(user.companyId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.labourService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabourDto: UpdateLabourDto, @CurrentUser() user: any) {
    return this.labourService.update(id, updateLabourDto, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.labourService.remove(id, user.companyId);
  }
}

