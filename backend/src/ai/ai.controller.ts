import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-readme/:projectId')
  generateReadme(
    @CurrentUser() user: { id: string },
    @Param('projectId') projectId: string
  ) {
    return this.aiService.generateProjectReadme(user.id, projectId);
  }

  @Post('generate-test/:fileId')
  generateTest(
    @CurrentUser() user: { id: string },
    @Param('fileId') fileId: string
  ) {
    return this.aiService.generateFileTest(user.id, fileId);
  }
}
