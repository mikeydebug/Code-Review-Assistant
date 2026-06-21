import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewStatus } from '@prisma/client';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    private db: DatabaseService,
    private ai: AiService,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    const project = await this.db.project.findFirst({
      where: { id: dto.projectId, userId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const review = await this.db.review.create({
      data: {
        projectId: dto.projectId,
        type: dto.type,
        status: ReviewStatus.IN_PROGRESS,
        files: {
          create: dto.fileIds.map((fileId) => ({ fileId })),
        },
      },
    });

    // Start background processing
    this.processReview(review.id, dto.fileIds, dto.type, userId).catch((e) => {
      this.logger.error(`Review process failed for ${review.id}`, e);
    });

    return review;
  }

  async findAll(projectId: string) {
    return this.db.review.findMany({
      where: { projectId },
      include: {
        _count: { select: { issues: true, files: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const review = await this.db.review.findUnique({
      where: { id },
      include: {
        files: { include: { file: true } },
        issues: true,
      },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  private async processReview(reviewId: string, fileIds: string[], type: 'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY', userId: string) {
    let combinedSummary = '';
    
    try {
      for (const fileId of fileIds) {
        const file = await this.db.file.findUnique({ where: { id: fileId } });
        if (!file || file.language === 'plaintext') continue; // skip binary/unknown files

        try {
          const result = await this.ai.reviewCode(userId, file.content, file.language, type);
          
          combinedSummary += `### ${file.name}\n${result.summary}\n\n`;

          for (const issue of result.issues) {
            await this.db.issue.create({
              data: {
                reviewId,
                title: issue.title,
                description: issue.description,
                recommendation: issue.recommendation,
                severity: issue.severity as any,
                fileName: file.name,
                lineNumber: issue.lineNumber,
              },
            });
          }
        } catch (fileError) {
          this.logger.warn(`Failed to review file ${file.name}: ${fileError.message}`);
          combinedSummary += `### ${file.name}\nFailed to review this file due to an AI error.\n\n`;
        }
      }

      await this.db.review.update({
        where: { id: reviewId },
        data: {
          status: ReviewStatus.COMPLETED,
          summary: combinedSummary || 'No significant issues found.',
          completedAt: new Date(),
        },
      });
    } catch (error) {
      await this.db.review.update({
        where: { id: reviewId },
        data: {
          status: ReviewStatus.FAILED,
          summary: `Review failed: ${error.message}`,
        },
      });
    }
  }
}
