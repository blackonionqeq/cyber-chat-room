import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { Observable } from 'rxjs';

@WebSocketGateway({ cors: { origin: "" } })
export class ChatGateway {
  @WebSocketServer()
  private server: Server

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join')
  join(client: Socket, payload: { roomId: string, userId: string }) {
    return new Observable(observer => {
      this.chatService.join(payload.roomId, client).then((roomName) => {
        this.server.to(roomName).emit('message', {
          type: 'join',
          userId: payload.userId,
        })
        observer.complete()
      })
    })
  }

  @SubscribeMessage('send')
  send(@MessageBody() payload: {
    userId: string,
    roomId: string,
    message: {
      type: 'TEXT' | 'IMAGE',
      content: string
    }
  }) {
    this.chatService.roomService.getRoomInfo(payload.roomId).then(({ name }) => {
      
      this.chatService.addContent(payload.roomId, {
        userId: payload.userId,
        type: payload.message.type,
        content: payload.message.content,
      })

      this.server.to(name).emit('message', {
        type: 'sendMessage',
        userId: payload.userId,
        message: payload.message,
      })

    })
  }
}
