import { Module } from '@nestjs/common';
import { ChatContentService } from './chat-content.service';
import { ChatContentController } from './chat-content.controller';

@Module({
  controllers: [ChatContentController],
  providers: [ChatContentService],
  exports: [ChatContentService]
})
export class ChatContentModule {}
