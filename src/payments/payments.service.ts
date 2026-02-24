import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto, companyId: string) {
    // Verify project belongs to company
    const project = await this.prisma.project.findFirst({
      where: {
        id: createPaymentDto.projectId,
        companyId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const data: Prisma.PaymentCreateInput = {
      milestone: createPaymentDto.milestone,
      amount: createPaymentDto.amount,
      dueDate: new Date(createPaymentDto.dueDate),
      status: createPaymentDto.status || 'Pending',
      paidDate: createPaymentDto.paidDate ? new Date(createPaymentDto.paidDate) : null,
      notes: createPaymentDto.notes,
      company: { connect: { id: companyId } },
      project: { connect: { id: createPaymentDto.projectId } },
    };

    return this.prisma.payment.create({ data });
  }

  async findAll(companyId: string, projectId?: string) {
    const where: Prisma.PaymentWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto, companyId: string) {
    await this.findOne(id, companyId);

    const data: Prisma.PaymentUpdateInput = {};
    if (updatePaymentDto.milestone !== undefined) data.milestone = updatePaymentDto.milestone;
    if (updatePaymentDto.amount !== undefined) data.amount = updatePaymentDto.amount;
    if (updatePaymentDto.dueDate !== undefined) data.dueDate = new Date(updatePaymentDto.dueDate);
    if (updatePaymentDto.status !== undefined) data.status = updatePaymentDto.status;
    if (updatePaymentDto.paidDate !== undefined) {
      data.paidDate = updatePaymentDto.paidDate ? new Date(updatePaymentDto.paidDate) : null;
    }
    if (updatePaymentDto.notes !== undefined) data.notes = updatePaymentDto.notes;

    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    // Hard delete - permanently remove from database
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}

