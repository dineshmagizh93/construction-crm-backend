import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createVendorDto: CreateVendorDto, @CurrentUser() user: any) {
    return this.vendorsService.create(createVendorDto, user.companyId);
  }

  @Get()
  findAll(@Query('type') type: string, @CurrentUser() user: any) {
    return this.vendorsService.findAll(user.companyId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vendorsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto, @CurrentUser() user: any) {
    return this.vendorsService.update(id, updateVendorDto, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vendorsService.remove(id, user.companyId);
  }
}

