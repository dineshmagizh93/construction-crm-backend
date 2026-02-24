import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDocumentDto: CreateDocumentDto, @CurrentUser() user: any) {
    return this.documentsService.create(createDocumentDto, user.companyId, user.userId);
  }

  @Get()
  findAll(@Query('projectId') projectId: string, @Query('type') type: string, @CurrentUser() user: any) {
    return this.documentsService.findAll(user.companyId, projectId, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentsService.findOne(id, user.companyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto, @CurrentUser() user: any) {
    return this.documentsService.update(id, updateDocumentDto, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentsService.remove(id, user.companyId);
  }
}

