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
	async latest(roomId: string) {
		return await this.prismaMongoService.chatContent.findFirst({
			where: {
				roomId,
			},
			orderBy: { updateTime: 'desc' }
		})
	}

	async listAfterDateTime(roomId: string, dateTime: string) {
		return await this.prismaMongoService.chatContent.findMany({
			where: {
				updateTime: { gt: dateTime }, roomId,
			},
			orderBy: { updateTime: 'asc' }
		})
	}
	async countAfterDateTime(roomId: string, dateTime?: string) {
		if (!dateTime) {
			return await this.prismaMongoService.chatContent.count({
				where: { roomId }
			})
		}
		return await this.prismaMongoService.chatContent.count({
			where: {
				updateTime: { gt: dateTime }, roomId,
			},
		})
	}

	async add(roomId: string, content: Pick<ChatContent, 'userId'|'type'|'content'>) {
		return await this.prismaMongoService.chatContent.create({
			data: { ...content, roomId }
		})
	}
}
