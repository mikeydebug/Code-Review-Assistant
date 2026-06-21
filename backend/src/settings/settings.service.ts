import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SettingsService {
  constructor(private db: DatabaseService) {}

  async getAiProviders(userId: string) {
    return this.db.aiProvider.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAiProvider(userId: string, data: { name: string; baseUrl: string; apiKey: string; modelName: string; isDefault: boolean }) {
    if (data.isDefault) {
      await this.db.aiProvider.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Check if it's the first one, make it default automatically
    const count = await this.db.aiProvider.count({ where: { userId } });
    const isDefault = count === 0 ? true : data.isDefault;

    return this.db.aiProvider.create({
      data: {
        ...data,
        isDefault,
        userId,
      },
    });
  }

  async removeAiProvider(userId: string, id: string) {
    const provider = await this.db.aiProvider.findFirst({ where: { id, userId } });
    if (!provider) throw new NotFoundException('Provider not found');

    await this.db.aiProvider.delete({ where: { id } });
    
    // If we deleted the default, make another one default
    if (provider.isDefault) {
      const first = await this.db.aiProvider.findFirst({ where: { userId } });
      if (first) {
        await this.db.aiProvider.update({
          where: { id: first.id },
          data: { isDefault: true },
        });
      }
    }
    return { success: true };
  }
}
