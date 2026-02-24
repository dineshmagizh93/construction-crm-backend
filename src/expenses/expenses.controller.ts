import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createExpenseDto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.create(createExpenseDto, user.companyId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @CurrentUser() user: any) {
    return this.expensesService.findAll(user.companyId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.update(id, updateExpenseDto, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.remove(id, user.companyId);
  }
}

