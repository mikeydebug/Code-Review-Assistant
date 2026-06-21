import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('project/:projectId')
  getSessions(@Param('projectId') projectId: string, @CurrentUser() user: { id: string }) {
    return this.chatService.getSessions(projectId, user.id);
  }

  @Post('project/:projectId')
  createSession(
    @Param('projectId') projectId: string,
    @CurrentUser() user: { id: string },
    @Body('title') title?: string
  ) {
    return this.chatService.createSession(projectId, user.id, title);
  }

  @Get('session/:sessionId')
  getSession(@Param('sessionId') sessionId: string, @CurrentUser() user: { id: string }) {
    return this.chatService.getSession(sessionId, user.id);
  }

  @Post('session/:sessionId/message')
  sendMessage(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: { id: string },
    @Body('content') content: string
  ) {
    return this.chatService.sendMessage(sessionId, user.id, content);
  }
}
