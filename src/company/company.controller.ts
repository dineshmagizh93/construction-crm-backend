import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { CompanyService, UpdateCompanyDto } from './company.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentCompany } from '../auth/decorators/current-company.decorator';

@Controller('company')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('me')
  async getMyCompany(@CurrentCompany() company: any) {
    if (!company) {
      return null;
    }
    return this.companyService.findOne(company.id);
  }

  @Patch('me')
  async updateMyCompany(
    @CurrentCompany() company: any,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    if (!company) {
      throw new Error('Company not found');
    }
    return this.companyService.update(company.id, updateCompanyDto);
  }
}

