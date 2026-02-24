import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto, companyId: string) {
    const data: Prisma.LeadCreateInput = {
      name: createLeadDto.name,
      phone: createLeadDto.phone,
      email: createLeadDto.email,
      type: createLeadDto.type || 'LEAD',
      source: createLeadDto.source,
      status: createLeadDto.status || 'New',
      assignedTo: createLeadDto.assignedTo,
      notes: createLeadDto.notes,
      company: {
        connect: { id: companyId },
      },
    };

    return this.prisma.lead.create({ data });
  }

  async findAll(companyId: string, type?: string) {
    const where: Prisma.LeadWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (type && type !== 'all') {
      where.type = type;
    }

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto, companyId: string) {
    await this.findOne(id, companyId);

    const data: Prisma.LeadUpdateInput = {};
    if (updateLeadDto.name !== undefined) data.name = updateLeadDto.name;
    if (updateLeadDto.phone !== undefined) data.phone = updateLeadDto.phone;
    if (updateLeadDto.email !== undefined) data.email = updateLeadDto.email;
    if (updateLeadDto.type !== undefined) data.type = updateLeadDto.type;
    if (updateLeadDto.source !== undefined) data.source = updateLeadDto.source;
    if (updateLeadDto.status !== undefined) data.status = updateLeadDto.status;
    if (updateLeadDto.assignedTo !== undefined) data.assignedTo = updateLeadDto.assignedTo;
    if (updateLeadDto.notes !== undefined) data.notes = updateLeadDto.notes;

    return this.prisma.lead.update({
      where: { id },
      data,
    });
  }

  async convertToClient(id: string, companyId: string) {
    const lead = await this.findOne(id, companyId);
    
    return this.prisma.lead.update({
      where: { id },
      data: {
        type: 'CLIENT',
        status: 'Converted',
      },
    });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    // Hard delete - permanently remove from database
    return this.prisma.lead.delete({
      where: { id },
    });
  }
}

