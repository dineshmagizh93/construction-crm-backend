import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getFinancialSummary(companyId: string, startDate?: string, endDate?: string) {
    const where: Prisma.PaymentWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    const payments = await this.prisma.payment.findMany({ where });
    const expenses = await this.prisma.expense.findMany({
      where: {
        companyId,
        deletedAt: null,
        ...(startDate || endDate ? {
          date: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        } : {}),
      },
    });

    const paidAmount = payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const pendingAmount = payments
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const overdueAmount = payments
      .filter(p => p.status === 'Overdue' || (p.status === 'Pending' && new Date(p.dueDate) < new Date()))
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = paidAmount - totalExpenses;

    return {
      payments: {
        paid: { count: payments.filter(p => p.status === 'Paid').length, amount: paidAmount },
        pending: { count: payments.filter(p => p.status === 'Pending').length, amount: pendingAmount },
        overdue: { count: payments.filter(p => p.status === 'Overdue' || (p.status === 'Pending' && new Date(p.dueDate) < new Date())).length, amount: overdueAmount },
        total: { count: payments.length, amount: paidAmount + pendingAmount },
      },
      expenses: {
        total: totalExpenses,
        count: expenses.length,
        byCategory: this.groupExpensesByCategory(expenses),
      },
      netProfit,
    };
  }

  private groupExpensesByCategory(expenses: any[]) {
    const byCategory: Record<string, number> = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      byCategory[category] = (byCategory[category] || 0) + Number(expense.amount);
    });
    return byCategory;
  }

  async getProjectSummary(companyId: string) {
    const projects = await this.prisma.project.findMany({
      where: { companyId, deletedAt: null },
      include: {
        payments: { where: { deletedAt: null } },
        expenses: { where: { deletedAt: null } },
      },
    });

    const summary = {
      total: projects.length,
      byStatus: {
        Planning: 0,
        'In Progress': 0,
        'On Hold': 0,
        Completed: 0,
      },
      totalBudget: 0,
      totalActual: 0,
      avgProgress: 0,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: p.progress,
        estimatedBudget: Number(p.estimatedBudget || 0),
        actualBudget: Number(p.actualBudget || 0),
        totalPayments: p.payments.filter(pay => pay.status === 'Paid').reduce((sum, pay) => sum + Number(pay.amount), 0),
        totalExpenses: p.expenses.reduce((sum, e) => sum + Number(e.amount), 0),
      })),
    };

    projects.forEach(p => {
      summary.byStatus[p.status as keyof typeof summary.byStatus]++;
      summary.totalBudget += Number(p.estimatedBudget || 0);
      summary.totalActual += Number(p.actualBudget || 0);
      summary.avgProgress += p.progress;
    });

    summary.avgProgress = projects.length > 0 ? summary.avgProgress / projects.length : 0;

    return summary;
  }

  async getExpenseSummary(companyId: string, startDate?: string, endDate?: string) {
    const where: Prisma.ExpenseWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await this.prisma.expense.findMany({ where });

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory = this.groupExpensesByCategory(expenses);

    return {
      total,
      count: expenses.length,
      byCategory,
    };
  }

  async getPaymentSummary(companyId: string, startDate?: string, endDate?: string) {
    const where: Prisma.PaymentWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    const payments = await this.prisma.payment.findMany({ where });

    const paid = payments.filter(p => p.status === 'Paid');
    const pending = payments.filter(p => p.status === 'Pending');
    const overdue = payments.filter(p => 
      p.status === 'Overdue' || (p.status === 'Pending' && new Date(p.dueDate) < new Date())
    );

    return {
      paid: {
        count: paid.length,
        amount: paid.reduce((sum, p) => sum + Number(p.amount), 0),
      },
      pending: {
        count: pending.length,
        amount: pending.reduce((sum, p) => sum + Number(p.amount), 0),
      },
      overdue: {
        count: overdue.length,
        amount: overdue.reduce((sum, p) => sum + Number(p.amount), 0),
      },
      total: {
        count: payments.length,
        amount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      },
    };
  }
}


