import { Inject, Injectable } from '@nestjs/common';
import { PrismaMongoService } from 'src/prisma-mongo/prisma-mongo.service';
import type { ChatContent } from '@prisma/mongo-client'

@Injectable()
export class ChatContentService {
	@Inject(PrismaMongoService)
	private prismaMongoService: PrismaMongoService

	async list(roomId: string) {
		return await this.prismaMongoService.chatContent.findMany({
			where: { roomId },
			orderBy: { updateTime: 'asc' }
		})
	}

	async add(roomId: string, content: Pick<ChatContent, 'userId'|'type'|'content'>) {
		return await this.prismaMongoService.chatContent.create({
			data: { ...content, roomId }
		})
	}
}
