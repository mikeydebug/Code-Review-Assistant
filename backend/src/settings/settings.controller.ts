import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('ai-providers')
  getAiProviders(@CurrentUser() user: { id: string }) {
    return this.settingsService.getAiProviders(user.id);
  }

  @Post('ai-providers')
  addAiProvider(
    @CurrentUser() user: { id: string },
    @Body() body: { name: string; baseUrl: string; apiKey: string; modelName: string; isDefault: boolean }
  ) {
    return this.settingsService.addAiProvider(user.id, body);
  }

  @Delete('ai-providers/:id')
  removeAiProvider(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.settingsService.removeAiProvider(user.id, id);
  }
}
