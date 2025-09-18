import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import type { MediaFile } from './media.types';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadRoot = join(process.cwd(), 'uploads');

  async persistFile(file: MediaFile | undefined, folder = 'general') {
    if (!file) return null;

    const safeFolder = this.sanitizeFolder(folder);
    const extension = this.resolveExtension(file);
    const filename = `${randomUUID()}${extension}`;
    const targetDir = join(this.uploadRoot, safeFolder);
    const targetPath = join(targetDir, filename);

    try {
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(targetPath, file.buffer);
    } catch (error) {
      this.logger.error(`Failed to persist file in ${targetPath}`, error as Error);
      throw new InternalServerErrorException('Could not save uploaded file');
    }

    return `/uploads/${safeFolder}/${filename}`;
  }

  async removeFile(fileUrl?: string | null) {
    if (!fileUrl || !fileUrl.startsWith('/uploads/')) return;

    const relativePath = fileUrl.replace('/uploads/', '');
    const absolutePath = join(this.uploadRoot, relativePath);

    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Failed to delete file ${absolutePath}: ${(error as Error).message}`);
      }
    }
  }

  private sanitizeFolder(folder: string) {
    const clean = folder.replace(/[^a-z0-9/_-]/gi, '').replace(/\.+/g, '.');
    return clean || 'general';
  }

  private resolveExtension(file: MediaFile) {
    const byName = extname(file.originalname || '');
    if (byName) return byName;

    switch (file.mimetype) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/gif':
        return '.gif';
      case 'image/webp':
        return '.webp';
      default:
        return '';
    }
  }
}
