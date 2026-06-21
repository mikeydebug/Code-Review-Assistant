import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';
import { SECURITY_PROMPT } from './prompts/security.prompt';
import { PERFORMANCE_PROMPT } from './prompts/performance.prompt';
import { CODE_QUALITY_PROMPT } from './prompts/code-quality.prompt';

const PROMPT_MAP: Record<string, string> = {
  SECURITY: SECURITY_PROMPT,
  PERFORMANCE: PERFORMANCE_PROMPT,
  CODE_QUALITY: CODE_QUALITY_PROMPT,
};

const issueSchema = z.object({
  issues: z.array(
    z.object({
      title: z.string().describe('Short title of the issue'),
      description: z.string().describe('Detailed description of what is wrong'),
      recommendation: z.string().describe('How to fix the issue'),
      severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).describe('Severity level'),
      lineNumber: z.number().nullable().describe('Line number if applicable, else null'),
    })
  ).describe('List of issues found in the file'),
  summary: z.string().describe('Overall summary of the review for this file'),
});

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private db: DatabaseService) {}

  async getClient(userId: string) {
    const provider = await this.db.aiProvider.findFirst({
      where: { userId, isDefault: true },
    });

    if (!provider) {
      if (process.env.OPENROUTER_API_KEY) {
        return new ChatOpenAI({
          configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: process.env.OPENROUTER_API_KEY,
          },
          model: 'anthropic/claude-3-haiku',
          temperature: 0.1,
        });
      }
      throw new BadRequestException(
        'No AI provider configured. Go to Settings → Add a provider and set it as default.'
      );
    }

    if (provider.baseUrl.includes('groq')) {
      return new ChatGroq({
        apiKey: provider.apiKey,
        model: provider.modelName,
        temperature: 0.1,
      });
    } else {
      return new ChatOpenAI({
        configuration: {
          baseURL: provider.baseUrl,
          apiKey: provider.apiKey,
        },
        model: provider.modelName,
        temperature: 0.1,
      });
    }
  }

  async reviewCode(
    userId: string,
    content: string,
    language: string,
    type: 'SECURITY' | 'PERFORMANCE' | 'CODE_QUALITY'
  ) {
    const llm = await this.getClient(userId);
    const parser = StructuredOutputParser.fromZodSchema(issueSchema);
    const formatInstructions = parser.getFormatInstructions();

    const systemTemplate = PROMPT_MAP[type];
    
    const prompt = new PromptTemplate({
      template: `${systemTemplate}\n\nReview the following {language} code:\n\`\`\`{language}\n{content}\n\`\`\``,
      inputVariables: ['language', 'content'],
      partialVariables: { format_instructions: formatInstructions },
    });

    try {
      const formattedPrompt = await prompt.format({ language, content });
      const response = await llm.invoke(formattedPrompt);
      
      const parsed = await parser.parse(response.content as string);
      return parsed;
    } catch (error) {
      this.logger.error('Failed to review code', error);
      throw error;
    }
  }

  async generateChatResponse(
    userId: string,
    projectId: string,
    history: { role: 'USER' | 'ASSISTANT'; content: string }[],
    userMessage: string
  ) {
    const llm = await this.getClient(userId);

    // Get project files for context (prioritize smaller files)
    const files = await this.db.file.findMany({
      where: { projectId },
      orderBy: { size: 'asc' },
      take: 15,
    });

    const codeContext = this.buildCodeContent(files, 15, 3000, 30000);
    const systemPrompt = `You are an expert code assistant. You have access to the following codebase:\n\n${codeContext}\n\nAnswer questions accurately. Reference specific file names when relevant. Format responses with markdown.`;

    const messages = [
      ['system', systemPrompt],
      ...history.map((m) => [m.role === 'USER' ? 'user' : 'assistant', m.content]),
      ['user', userMessage],
    ] as any;

    try {
      const response = await llm.invoke(messages);
      return response.content as string;
    } catch (error) {
      this.logger.error('Failed to generate chat response', error);
      throw error;
    }
  }

  private buildCodeContent(files: any[], maxFiles: number, maxPerFile: number, maxTotal: number): string {
    let total = 0;
    const parts: string[] = [];

    for (const file of files.slice(0, maxFiles)) {
      if (file.language === 'plaintext') continue;
      const content = file.content.length > maxPerFile
        ? file.content.slice(0, maxPerFile) + '\n... [truncated]'
        : file.content;

      const block = `### File: ${file.path}\n\`\`\`${file.language}\n${content}\n\`\`\``;
      if (total + block.length > maxTotal) break;

      parts.push(block);
      total += block.length;
    }

    return parts.join('\n\n---\n\n');
  }

  async generateProjectReadme(userId: string, projectId: string) {
    const llm = await this.getClient(userId);
    const files = await this.db.file.findMany({
      where: { projectId },
      orderBy: { size: 'asc' },
      take: 20,
    });
    const codeContext = this.buildCodeContent(files, 20, 2000, 40000);

    const prompt = `You are an expert technical writer and senior software engineer. Analyze the following project codebase and generate a highly professional, comprehensive README.md file for the project. 

Include:
- Project Title & Description
- Key Features
- Tech Stack
- Folder Structure (if inferable)
- Getting Started / Setup Instructions
- Architecture Overview

Codebase context:
${codeContext}

Return ONLY the markdown content. Do not include any conversational text outside the markdown.`;

    try {
      const response = await llm.invoke(prompt);
      return { markdown: response.content as string };
    } catch (error) {
      this.logger.error('Failed to generate README', error);
      throw error;
    }
  }

  async generateFileTest(userId: string, fileId: string) {
    const llm = await this.getClient(userId);
    const file = await this.db.file.findUnique({ where: { id: fileId } });
    if (!file) throw new BadRequestException('File not found');

    const prompt = `You are an expert software engineer. Write a comprehensive unit test suite for the following ${file.language} file.
Focus on edge cases, mocking dependencies appropriately, and following best practices (like using Jest or standard testing libraries for the language).

File Name: ${file.name}
Code:
\`\`\`${file.language}
${file.content}
\`\`\`

Return ONLY the markdown code block containing the test code. Do not include any conversational text outside the markdown.`;

    try {
      const response = await llm.invoke(prompt);
      return { markdown: response.content as string };
    } catch (error) {
      this.logger.error('Failed to generate tests', error);
      throw error;
    }
  }
}
