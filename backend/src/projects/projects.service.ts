import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private db: DatabaseService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.db.project.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.db.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { files: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.db.project.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: { files: true, reviews: true },
        },
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(userId: string, id: string) {
    const project = await this.db.project.findFirst({
      where: { id, userId },
    });

    if (!project) throw new NotFoundException('Project not found');

    return this.db.project.delete({
      where: { id },
    });
  }
}
