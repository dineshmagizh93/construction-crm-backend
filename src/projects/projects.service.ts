import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, companyId: string) {
    const data: Prisma.ProjectCreateInput = {
      name: createProjectDto.name,
      clientName: createProjectDto.clientName,
      location: createProjectDto.location,
      description: createProjectDto.description,
      startDate: createProjectDto.startDate
        ? new Date(createProjectDto.startDate)
        : null,
      endDate: createProjectDto.endDate
        ? new Date(createProjectDto.endDate)
        : null,
      status: createProjectDto.status,
      estimatedBudget: createProjectDto.estimatedBudget
        ? new Prisma.Decimal(createProjectDto.estimatedBudget)
        : null,
      actualBudget: createProjectDto.actualBudget
        ? new Prisma.Decimal(createProjectDto.actualBudget)
        : null,
      progress: createProjectDto.progress ?? 0,
      company: {
        connect: { id: companyId },
      },
    };

    return this.prisma.project.create({
      data,
    });
  }

  async findAll(companyId: string) {
    return this.prisma.project.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, companyId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, companyId: string) {
    // Verify project exists and belongs to company
    const existingProject = await this.findOne(id, companyId);

    const data: Prisma.ProjectUpdateInput = {};

    if (updateProjectDto.name !== undefined) {
      data.name = updateProjectDto.name;
    }
    if (updateProjectDto.clientName !== undefined) {
      data.clientName = updateProjectDto.clientName;
    }
    if (updateProjectDto.location !== undefined) {
      data.location = updateProjectDto.location;
    }
    if (updateProjectDto.description !== undefined) {
      data.description = updateProjectDto.description;
    }
    if (updateProjectDto.startDate !== undefined) {
      data.startDate = updateProjectDto.startDate
        ? new Date(updateProjectDto.startDate)
        : null;
    }
    if (updateProjectDto.endDate !== undefined) {
      data.endDate = updateProjectDto.endDate
        ? new Date(updateProjectDto.endDate)
        : null;
    }
    if (updateProjectDto.status !== undefined) {
      data.status = updateProjectDto.status;
    }
    if (updateProjectDto.estimatedBudget !== undefined) {
      data.estimatedBudget = updateProjectDto.estimatedBudget
        ? new Prisma.Decimal(updateProjectDto.estimatedBudget)
        : null;
    }
    if (updateProjectDto.actualBudget !== undefined) {
      data.actualBudget = updateProjectDto.actualBudget
        ? new Prisma.Decimal(updateProjectDto.actualBudget)
        : null;
    }
    if (updateProjectDto.progress !== undefined) {
      data.progress = updateProjectDto.progress;
    }

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, companyId: string) {
    // Verify project exists and belongs to company
    await this.findOne(id, companyId);

    // Hard delete - permanently remove from database
    return this.prisma.project.delete({
      where: { id },
    });
  }

  async getStats(companyId: string) {
    const [total, inProgress, completed, onHold, planning] = await Promise.all([
      this.prisma.project.count({
        where: {
          companyId,
          deletedAt: null,
        },
      }),
      this.prisma.project.count({
        where: {
          companyId,
          status: 'In Progress',
          deletedAt: null,
        },
      }),
      this.prisma.project.count({
        where: {
          companyId,
          status: 'Completed',
          deletedAt: null,
        },
      }),
      this.prisma.project.count({
        where: {
          companyId,
          status: 'On Hold',
          deletedAt: null,
        },
      }),
      this.prisma.project.count({
        where: {
          companyId,
          status: 'Planning',
          deletedAt: null,
        },
      }),
    ]);

    const projects = await this.prisma.project.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      select: {
        progress: true,
      },
    });

    const avgProgress =
      projects.length > 0
        ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
        : 0;

    return {
      total,
      inProgress,
      completed,
      onHold,
      planning,
      avgProgress: Math.round(avgProgress * 100) / 100,
    };
  }
}

