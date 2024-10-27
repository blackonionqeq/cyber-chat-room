import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatContentService } from './chat-content.service';

@Controller('chat-content')
export class ChatContentController {
  constructor(private readonly chatContentService: ChatContentService) {}

  @Get('list/:roomId')
  async list(@Param('roomId') roomId: string) {
    return await this.chatContentService.list(roomId)
  }
  @Get('list-after-date-time')
  async listAfterDateTime(@Query('roomId') roomId: string, @Query('dateTime') dateTime: string) {
    return await this.chatContentService.listAfterDateTime(roomId, dateTime)
  }
  @Get('count-after-date-time')
  async countAfterDateTime(@Query('roomId') roomId: string, @Query('dateTime') dateTime: string) {
    return await this.chatContentService.countAfterDateTime(roomId, dateTime)
  }
}
