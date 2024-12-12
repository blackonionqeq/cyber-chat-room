import { Inject, Injectable } from '@nestjs/common';
import { PrismaMongoService } from 'src/prisma-mongo/prisma-mongo.service';

@Injectable()
export class FavoriteService {
	@Inject(PrismaMongoService)
	private prismaMongoService: PrismaMongoService
	async add(cId: string, uId: string) {
		const target = await this.prismaMongoService.chatContent.findUnique({ where: { id: cId } })
		await this.prismaMongoService.favorite.create({
			data: {
				userId: uId, chatContentId: cId,
				snapshotType: target.type, snapshotContent: target.content,
				fromUserId: target.userId,
			}
		})
		return null
	}

	async list(uId: string) {
		return await this.prismaMongoService.favorite.findMany({
			where: { userId: uId },
			orderBy: { updateTime: 'desc' }
		})
	}
	async remove(fId: string) {
		await this.prismaMongoService.favorite.delete({
			where: { id: fId }
		})
		return null
	}
}
