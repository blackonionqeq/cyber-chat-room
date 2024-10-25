import { Inject, Injectable } from '@nestjs/common';
import type { Socket } from 'socket.io';
import { ChatContentService } from 'src/chat-content/chat-content.service';
import { ChatroomService } from 'src/chatroom/chatroom.service';

@Injectable()
export class ChatService {
	@Inject(ChatroomService)
	roomService: ChatroomService
	@Inject(ChatContentService)
	private chatContentService: ChatContentService


	async join(roomId: string, client: Socket) {
		const room = await this.roomService.getRoomInfo(roomId)
		client.join(room.name)
		return room.name
	}

	async addContent(...args: Parameters<typeof this.chatContentService['add']>) {
		return await this.chatContentService.add(...args)
	}
}
