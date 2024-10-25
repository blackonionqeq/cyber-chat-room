import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatContentModule } from 'src/chat-content/chat-content.module';
import { ChatroomModule } from 'src/chatroom/chatroom.module';

@Module({
  providers: [ChatGateway, ChatService],
  imports: [ChatroomModule, ChatContentModule]
})
export class ChatModule {}
