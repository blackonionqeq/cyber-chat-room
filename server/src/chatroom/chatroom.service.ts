import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatroomService {
	@Inject(PrismaService)
	private prismaService: PrismaService

	async createPrivateChat(id1: string, id2: string) {
		// 先检查是否存在
		const isExist = await this.prismaService.userChatRoom.findFirst({
			where: { OR: [{userId: id1, userId2: id2},{ userId: id2, userId2: id1 }] }
		})
		if (isExist) return isExist.roomId
		const { id } = await this.prismaService.chatRoom.create({
			select: { id: true },
			data: {},
		})
		await this.prismaService.userChatRoom.create({
			data: { userId: id1, roomId: id, userId2: id2 }
		})
		return id
	}

	async createGroupChat(ids: string[], name = '新的群聊') {
		const { id: roomId } = await this.prismaService.chatRoom.create({
			data: {
				groupChat: true,
				name,
			}
		})
		// 把所有用户都关联到新的用户房间表
		await Promise.all(
			ids.map(async (userId) => await this.prismaService.userChatRoom.create({
				data: { userId, roomId }
			}))
		)
		return roomId
	}

	async getRoomInfo(roomId: string) {
		return await this.prismaService.chatRoom.findUnique({
			where: { id: roomId },
		})
	}

	async list(id: string) {
		const roomIds = (await this.prismaService.userChatRoom.findMany({
			where: { OR: [ { userId: id, }, { userId2: id} ] },
			select: { roomId: true }
		})).map(i => i.roomId)
		let roomInfos = await Promise.all(
			roomIds.map(async roomId => await this.prismaService.chatRoom.findUnique({
				where: { id: roomId },
			}))
		)
		roomInfos = await Promise.all(
			roomInfos.map(async roomInfo => {
				// 如果是群聊，直接返回信息即可
				if (roomInfo.groupChat) return roomInfo
				// 如果是单聊，还要反向查询好友名字，方便前端显示“与xxx的私聊”中的xxx
				const { userId, userId2 } = await this.prismaService.userChatRoom.findFirst({
					where: { roomId: roomInfo.id }
				})
				const friendId = userId === id ? userId2 : userId
				const opposite = (await this.prismaService.user.findUnique({ where: { id: friendId }, select: { username: true, id: true } }))
				roomInfo.name = opposite.username
				// @ts-ignore
				roomInfo.userId = opposite.id
				return roomInfo
			})
		)
		return roomInfos
	}
	async getUserIdsByRoomId(roomId: string) {
		return (await this.prismaService.userChatRoom.findMany({
			where: {roomId}, select: { userId: true }
		})).map(i => i.userId)
	}
	async join(roomId: string, userId: string) {
		const room = await this.prismaService.chatRoom.findUnique({ where: { id: roomId } })
		if (!room.groupChat) throw new BadRequestException('不能加入私聊')
		await this.prismaService.userChatRoom.create({
			data: { userId, roomId }
		})
		return null
	}
	async quit(roomId: string, userId: string) {
		const room = await this.prismaService.chatRoom.findUnique({ where: { id: roomId } })
		if (!room.groupChat) throw new BadRequestException('不能离开私聊')
		await this.prismaService.userChatRoom.deleteMany({
			where: {userId, roomId},
		})
		return null
	}
}
