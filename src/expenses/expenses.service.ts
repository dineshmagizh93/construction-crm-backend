import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: createExpenseDto.projectId, companyId, deletedAt: null },
    });

    if (!project) throw new NotFoundException('Project not found');

    const data: Prisma.ExpenseCreateInput = {
      category: createExpenseDto.category,
      amount: createExpenseDto.amount,
      date: new Date(createExpenseDto.date),
      paidTo: createExpenseDto.paidTo,
      notes: createExpenseDto.notes,
      attachment: createExpenseDto.attachment,
      company: { connect: { id: companyId } },
      project: { connect: { id: createExpenseDto.projectId } },
    };

    return this.prisma.expense.create({ data });
  }

  async findAll(companyId: string, projectId?: string) {
    const where: Prisma.ExpenseWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (projectId) where.projectId = projectId;

    return this.prisma.expense.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { project: { select: { id: true, name: true } } },
    });

    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, companyId: string) {
    await this.findOne(id, companyId);

    const data: Prisma.ExpenseUpdateInput = {};
    if (updateExpenseDto.category !== undefined) data.category = updateExpenseDto.category;
    if (updateExpenseDto.amount !== undefined) data.amount = updateExpenseDto.amount;
    if (updateExpenseDto.date !== undefined) data.date = new Date(updateExpenseDto.date);
    if (updateExpenseDto.paidTo !== undefined) data.paidTo = updateExpenseDto.paidTo;
    if (updateExpenseDto.notes !== undefined) data.notes = updateExpenseDto.notes;
    if (updateExpenseDto.attachment !== undefined) data.attachment = updateExpenseDto.attachment;

    return this.prisma.expense.update({ where: { id }, data });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    // Hard delete - permanently remove from database
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}

