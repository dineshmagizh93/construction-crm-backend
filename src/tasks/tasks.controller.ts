import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskPositionDto } from './dto/update-task-position.dto';
import { CreateTaskCommentDto } from './dto/create-task-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.create(user.companyId, createTaskDto, user.userId);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    return this.tasksService.findAll(user.companyId, {
      projectId,
      status,
      assignedTo,
      priority,
      search,
    });
  }

  @Get('stats')
  getStats(@CurrentUser() user: any, @Query('projectId') projectId?: string) {
    return this.tasksService.getTaskStats(user.companyId, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.update(id, user.companyId, updateTaskDto, user.userId);
  }

  @Post('move')
  updatePosition(@Body() updatePositionDto: UpdateTaskPositionDto, @CurrentUser() user: any) {
    return this.tasksService.updatePosition(user.companyId, updatePositionDto, user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.remove(id, user.companyId, user.userId);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateTaskCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.addComment(taskId, user.companyId, createCommentDto, user.userId);
  }

  @Get(':id/activities')
  getActivities(@Param('id') taskId: string, @CurrentUser() user: any) {
    return this.tasksService.getActivities(taskId, user.companyId);
  }
}

