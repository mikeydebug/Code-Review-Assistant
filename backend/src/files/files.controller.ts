import { Controller, Post, Get, Param, Body, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects/:projectId/files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post('zip')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 50 * 1024 * 1024 } }))
  uploadZip(
    @Param('projectId') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.processZip(projectId, file.buffer);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 100, { limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadFiles(
    @Param('projectId') projectId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.processFiles(projectId, files);
  }

  @Post('github')
  uploadGithub(
    @Param('projectId') projectId: string,
    @Body('url') url: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.processGithub(projectId, url);
  }

  @Get()
  getFileTree(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.getFileTree(projectId, user.id);
  }

  @Get(':fileId')
  getFile(
    @Param('fileId') fileId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.filesService.getFileById(fileId, user.id);
  }
}
