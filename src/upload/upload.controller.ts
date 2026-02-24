import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

const storage = memoryStorage();

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.uploadService.uploadFile(file, 'documents');
  }

  @Post('photos')
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per photo
    }),
  )
  async uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    return this.uploadService.uploadMultipleFiles(files, 'photos');
  }
}


