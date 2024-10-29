import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
// import { Observable } from 'rxjs';

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway {
  @WebSocketServer()
  private server: Server

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join')
  join(client: Socket, {roomId, userId}: { roomId: string, userId: string }) {
    // this.chatService.join(roomId)
    roomId = roomId.toString()
    client.join(roomId)
    
    this.server.to(roomId).emit('message', {
      type: 'join',
      userId: userId,
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
    // this.chatService.roomService.getRoomInfo(payload.roomId).then(({ name }) => {
      payload.roomId = payload.roomId.toString()
      
      this.chatService.addContent(payload.roomId, {
        userId: payload.userId,
        type: payload.message.type,
        content: payload.message.content,
      }).then(content => {

        this.server.to(payload.roomId).emit('message', {
          type: 'sendMessage',
          userId: payload.userId,
          message: payload.message,
          updateTime: content.updateTime,
          createTime: content.createTime,
          roomId: content.roomId,
          id: content.id,
        })
      })


    // })
  }
}
