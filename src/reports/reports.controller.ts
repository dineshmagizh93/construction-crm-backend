import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('financial-summary')
  async getFinancialSummary(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getFinancialSummary(user.companyId, startDate, endDate);
  }

  @Get('project-summary')
  async getProjectSummary(@CurrentUser() user: any) {
    return this.reportsService.getProjectSummary(user.companyId);
  }

  @Get('expense-summary')
  async getExpenseSummary(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getExpenseSummary(user.companyId, startDate, endDate);
  }

  @Get('payment-summary')
  async getPaymentSummary(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.reportsService.getPaymentSummary(user.companyId, startDate, endDate);
  }
}


