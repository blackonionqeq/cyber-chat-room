import { Controller, Get, Param } from '@nestjs/common';
import { ChatContentService } from './chat-content.service';

@Controller('chat-content')
export class ChatContentController {
  constructor(private readonly chatContentService: ChatContentService) {}

  @Get('list/:roomId')
  async list(@Param('roomId') roomId: string) {
    return await this.chatContentService.list(roomId)
  }
}
