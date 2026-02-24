import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: 'documents' | 'photos'): Promise<{ url: string; fileName: string; fileSize: number }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Validate file type
    const allowedMimeTypes = folder === 'documents'
      ? ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
      : ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
    }

    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const folderPath = path.join(this.uploadPath, folder);
    
    // Ensure folder exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    // Return URL (in production, this would be a CDN URL)
    const url = `/uploads/${folder}/${fileName}`;

    return {
      url,
      fileName: file.originalname,
      fileSize: file.size,
    };
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: 'documents' | 'photos'): Promise<Array<{ url: string; fileName: string; fileSize: number }>> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const relativePath = fileUrl.replace('/uploads/', '');
      const filePath = path.join(this.uploadPath, relativePath);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Don't throw - file might not exist
    }
  }
}


