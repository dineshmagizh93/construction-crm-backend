import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteProgressDto } from './dto/create-site-progress.dto';
import { UpdateSiteProgressDto } from './dto/update-site-progress.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SiteProgressService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateSiteProgressDto, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: createDto.projectId, companyId, deletedAt: null },
    });

    if (!project) throw new NotFoundException('Project not found');

    const data: Prisma.SiteProgressCreateInput = {
      date: new Date(createDto.date),
      notes: createDto.notes,
      photos: JSON.stringify(createDto.photos || []),
      company: { connect: { id: companyId } },
      project: { connect: { id: createDto.projectId } },
    };

    const progress = await this.prisma.siteProgress.create({ data });
    return { ...progress, photos: JSON.parse(progress.photos) };
  }

  async findAll(companyId: string, projectId?: string) {
    const where: Prisma.SiteProgressWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (projectId) where.projectId = projectId;

    const progresses = await this.prisma.siteProgress.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });

    return progresses.map(p => ({ ...p, photos: JSON.parse(p.photos) }));
  }

  async findOne(id: string, companyId: string) {
    const progress = await this.prisma.siteProgress.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { project: { select: { id: true, name: true } } },
    });

    if (!progress) throw new NotFoundException('Site progress not found');
    return { ...progress, photos: JSON.parse(progress.photos) };
  }

  async update(id: string, updateDto: UpdateSiteProgressDto, companyId: string) {
    await this.findOne(id, companyId);

    const data: Prisma.SiteProgressUpdateInput = {};
    if (updateDto.date !== undefined) data.date = new Date(updateDto.date);
    if (updateDto.notes !== undefined) data.notes = updateDto.notes;
    if (updateDto.photos !== undefined) data.photos = JSON.stringify(updateDto.photos);

    const updated = await this.prisma.siteProgress.update({ where: { id }, data });
    return { ...updated, photos: JSON.parse(updated.photos) };
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    // Hard delete - permanently remove from database
    return this.prisma.siteProgress.delete({
      where: { id },
    });
  }
}

