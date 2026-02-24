import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabourDto } from './dto/create-labour.dto';
import { UpdateLabourDto } from './dto/update-labour.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LabourService {
  constructor(private prisma: PrismaService) {}

  async create(createLabourDto: CreateLabourDto, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: createLabourDto.projectId, companyId, deletedAt: null },
    });

    if (!project) throw new NotFoundException('Project not found');

    const data: Prisma.LabourCreateInput = {
      category: createLabourDto.category,
      headcount: createLabourDto.headcount,
      costPerDay: createLabourDto.costPerDay,
      date: new Date(createLabourDto.date),
      notes: createLabourDto.notes,
      company: { connect: { id: companyId } },
      project: { connect: { id: createLabourDto.projectId } },
    };

    return this.prisma.labour.create({ data });
  }

  async findAll(companyId: string, projectId?: string) {
    const where: Prisma.LabourWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (projectId) where.projectId = projectId;

    return this.prisma.labour.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const labour = await this.prisma.labour.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { project: { select: { id: true, name: true } } },
    });

    if (!labour) throw new NotFoundException('Labour entry not found');
    return labour;
  }

  async update(id: string, updateLabourDto: UpdateLabourDto, companyId: string) {
    await this.findOne(id, companyId);

    const data: Prisma.LabourUpdateInput = {};
    if (updateLabourDto.category !== undefined) data.category = updateLabourDto.category;
    if (updateLabourDto.headcount !== undefined) data.headcount = updateLabourDto.headcount;
    if (updateLabourDto.costPerDay !== undefined) data.costPerDay = updateLabourDto.costPerDay;
    if (updateLabourDto.date !== undefined) data.date = new Date(updateLabourDto.date);
    if (updateLabourDto.notes !== undefined) data.notes = updateLabourDto.notes;

    return this.prisma.labour.update({ where: { id }, data });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    // Hard delete - permanently remove from database
    return this.prisma.labour.delete({
      where: { id },
    });
  }
}

