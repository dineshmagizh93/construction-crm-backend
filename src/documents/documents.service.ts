import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto, companyId: string, userId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: createDocumentDto.projectId, companyId, deletedAt: null },
    });

    if (!project) throw new NotFoundException('Project not found');

    const data: Prisma.DocumentCreateInput = {
      name: createDocumentDto.name,
      type: createDocumentDto.type,
      fileUrl: createDocumentDto.fileUrl,
      fileName: createDocumentDto.fileName || 'document',
      fileSize: createDocumentDto.fileSize,
      notes: createDocumentDto.notes,
      uploadedBy: userId,
      company: { connect: { id: companyId } },
      project: { connect: { id: createDocumentDto.projectId } },
    };

    return this.prisma.document.create({ data });
  }

  async findAll(companyId: string, projectId?: string, type?: string) {
    const where: Prisma.DocumentWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;

    return this.prisma.document.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { project: { select: { id: true, name: true } } },
    });

    if (!document) throw new NotFoundException('Document not found');
    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, companyId: string) {
    await this.findOne(id, companyId);

    const data: Prisma.DocumentUpdateInput = {};
    if (updateDocumentDto.name !== undefined) data.name = updateDocumentDto.name;
    if (updateDocumentDto.type !== undefined) data.type = updateDocumentDto.type;
    if (updateDocumentDto.fileUrl !== undefined) data.fileUrl = updateDocumentDto.fileUrl;
    if (updateDocumentDto.fileName !== undefined) data.fileName = updateDocumentDto.fileName;
    if (updateDocumentDto.fileSize !== undefined) data.fileSize = updateDocumentDto.fileSize;
    if (updateDocumentDto.notes !== undefined) data.notes = updateDocumentDto.notes;

    return this.prisma.document.update({ where: { id }, data });
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);
    // Hard delete - permanently remove from database
    return this.prisma.document.delete({
      where: { id },
    });
  }
}

