import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskPositionDto } from './dto/update-task-position.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, createTaskDto: CreateTaskDto, userId: string) {
    // Get max position for the status
    const maxPosition = await this.prisma.task.findFirst({
      where: {
        companyId,
        status: createTaskDto.status || TaskStatus.TODO,
        deletedAt: null,
      },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        companyId,
        status: createTaskDto.status || TaskStatus.TODO,
        priority: createTaskDto.priority || 'Medium',
        position: createTaskDto.position ?? (maxPosition ? maxPosition.position + 1 : 0),
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await this.logActivity(task.id, userId, 'created', `Task "${task.title}" was created`);

    return task;
  }

  async findAll(companyId: string, filters?: {
    projectId?: string;
    status?: string;
    assignedTo?: string;
    priority?: string;
    search?: string;
  }) {
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            activities: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { position: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return tasks;
  }

  async findOne(id: string, companyId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
          where: { deletedAt: null },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, companyId: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const existingTask = await this.prisma.task.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!existingTask) {
      throw new NotFoundException('Task not found');
    }

    const updateData: any = { ...updateTaskDto };
    
    if (updateTaskDto.dueDate) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log activity for changes
    const changes: string[] = [];
    if (updateTaskDto.title && updateTaskDto.title !== existingTask.title) {
      changes.push(`title changed to "${updateTaskDto.title}"`);
    }
    if (updateTaskDto.status && updateTaskDto.status !== existingTask.status) {
      changes.push(`status changed to "${updateTaskDto.status}"`);
    }
    if (updateTaskDto.priority && updateTaskDto.priority !== existingTask.priority) {
      changes.push(`priority changed to "${updateTaskDto.priority}"`);
    }
    if (updateTaskDto.assignedTo && updateTaskDto.assignedTo !== existingTask.assignedTo) {
      changes.push('assignee changed');
    }

    if (changes.length > 0) {
      await this.logActivity(task.id, userId, 'updated', changes.join(', '));
    }

    return task;
  }

  async updatePosition(companyId: string, updatePositionDto: UpdateTaskPositionDto, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: updatePositionDto.taskId,
        companyId,
        deletedAt: null,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // If status changed, we need to reorder positions
    if (task.status !== updatePositionDto.newStatus) {
      // Increment positions of tasks after the new position in the new status
      await this.prisma.task.updateMany({
        where: {
          companyId,
          status: updatePositionDto.newStatus,
          position: { gte: updatePositionDto.newPosition },
          deletedAt: null,
        },
        data: {
          position: { increment: 1 },
        },
      });

      // Decrement positions of tasks after the old position in the old status
      await this.prisma.task.updateMany({
        where: {
          companyId,
          status: task.status,
          position: { gt: task.position },
          deletedAt: null,
        },
        data: {
          position: { decrement: 1 },
        },
      });

      await this.logActivity(
        task.id,
        userId,
        'moved',
        `Task moved from "${task.status}" to "${updatePositionDto.newStatus}"`,
      );
    } else {
      // Same status, just reordering
      if (task.position < updatePositionDto.newPosition) {
        // Moving down
        await this.prisma.task.updateMany({
          where: {
            companyId,
            status: updatePositionDto.newStatus,
            position: {
              gt: task.position,
              lte: updatePositionDto.newPosition,
            },
            deletedAt: null,
          },
          data: {
            position: { decrement: 1 },
          },
        });
      } else if (task.position > updatePositionDto.newPosition) {
        // Moving up
        await this.prisma.task.updateMany({
          where: {
            companyId,
            status: updatePositionDto.newStatus,
            position: {
              gte: updatePositionDto.newPosition,
              lt: task.position,
            },
            deletedAt: null,
          },
          data: {
            position: { increment: 1 },
          },
        });
      }
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: updatePositionDto.taskId },
      data: {
        status: updatePositionDto.newStatus,
        position: updatePositionDto.newPosition,
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedTask;
  }

  async remove(id: string, companyId: string, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, companyId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Hard delete - permanently remove from database
    await this.prisma.task.delete({
      where: { id },
    });

    await this.logActivity(task.id, userId, 'deleted', `Task "${task.title}" was deleted`);

    return { message: 'Task deleted successfully' };
  }

  async addComment(taskId: string, companyId: string, createCommentDto: CreateTaskCommentDto, userId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, companyId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const comment = await this.prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content: createCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await this.logActivity(taskId, userId, 'commented', 'Added a comment');

    return comment;
  }

  async getActivities(taskId: string, companyId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, companyId, deletedAt: null },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const activities = await this.prisma.taskActivity.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return activities;
  }

  private async logActivity(taskId: string, userId: string, action: string, details?: string) {
    await this.prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action,
        details,
      },
    });
  }

  async getTaskStats(companyId: string, projectId?: string) {
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      select: {
        status: true,
        priority: true,
        dueDate: true,
      },
    });

    const stats = {
      total: tasks.length,
      byStatus: {
        'To Do': tasks.filter(t => t.status === 'To Do').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        'Review': tasks.filter(t => t.status === 'Review').length,
        'Done': tasks.filter(t => t.status === 'Done').length,
        'Blocked': tasks.filter(t => t.status === 'Blocked').length,
      },
      byPriority: {
        Low: tasks.filter(t => t.priority === 'Low').length,
        Medium: tasks.filter(t => t.priority === 'Medium').length,
        High: tasks.filter(t => t.priority === 'High').length,
        Urgent: tasks.filter(t => t.priority === 'Urgent').length,
      },
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done').length,
    };

    return stats;
  }
}

