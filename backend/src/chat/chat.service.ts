import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AiService } from '../ai/ai.service';
import { MessageRole } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private db: DatabaseService, private ai: AiService) {}

  async getSessions(projectId: string, userId: string) {
    return this.db.chatSession.findMany({
      where: { projectId, userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
      },
    });
  }

  async getSession(sessionId: string, userId: string) {
    const session = await this.db.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async createSession(projectId: string, userId: string, title: string = 'New Chat') {
    return this.db.chatSession.create({
      data: { projectId, userId, title },
    });
  }

  async sendMessage(sessionId: string, userId: string, content: string) {
    const session = await this.getSession(sessionId, userId);

    // Save user message
    await this.db.message.create({
      data: { sessionId, role: MessageRole.USER, content },
    });

    // Generate AI response
    const aiResponse = await this.ai.generateChatResponse(
      userId,
      session.projectId,
      session.messages.map((m) => ({ role: m.role, content: m.content })),
      content
    );

    // Save AI message
    const assistantMessage = await this.db.message.create({
      data: { sessionId, role: MessageRole.ASSISTANT, content: aiResponse },
    });

    // Update session
    await this.db.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return assistantMessage;
  }
}
