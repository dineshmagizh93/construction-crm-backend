import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createLeadDto: CreateLeadDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.create(createLeadDto, user.companyId);
  }

  @Get()
  findAll(@Query('type') type: string, @CurrentUser() user: any) {
    return this.leadsService.findAll(user.companyId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @CurrentUser() user: any,
  ) {
    return this.leadsService.update(id, updateLeadDto, user.companyId);
  }

  @Post(':id/convert')
  convertToClient(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.convertToClient(id, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.remove(id, user.companyId);
  }
}

