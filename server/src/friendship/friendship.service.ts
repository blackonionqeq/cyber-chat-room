import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RequestFriendshipDto } from './dto/request-friendship.dto';
import { PrismaService } from 'src/prisma/prisma.service';
// import { FriendRequestStatus } from './friendship-type.d';
import { FriendRequestStatus } from '@prisma/client';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class FriendshipService {
	@Inject(PrismaService)
	private prismaService: PrismaService
	@Inject(RedisService)
	private redisService: RedisService
	async request({
		fromId,
		data
	}: { fromId: string, data: RequestFriendshipDto }) {
		const toUser = await this.prismaService.user.findUnique({
			where: { username: data.username }
		})
		if (!toUser) throw new BadRequestException('目标用户不存在')
		await this.prismaService.friendRequest.create({
			data: {
				fromId,
				toId: toUser.id,
				reason: data.reason,
			}
		})
		return null
	}

	async changeRequestStatus({
		fromId, toId, type
	}: { fromId: string, toId: string, type: FriendRequestStatus }) {
		const targetRequest = await this.prismaService.friendRequest.findFirst({
			where: {
				fromId, toId, status: FriendRequestStatus.PENDING,
			}
		})
		if (!targetRequest) {
			throw new BadRequestException('找不到该好友申请')
		}
		await this.prismaService.friendRequest.update({
			where: { id: targetRequest.id },
			data: { status: type }
		})
		if(type === FriendRequestStatus.APPROVED) {
			await this.prismaService.friendShip.create({
				data: { fromId, toId, status: true }
			})
		}
		return null
	}
	async changeRequestStatusById(requestId: number, type: FriendRequestStatus) {
		const {fromId, toId} = await this.prismaService.friendRequest.update({
			where: { id: requestId },
			data: { status: type },
			select: { fromId: true, toId: true }
		})
		if(type === FriendRequestStatus.APPROVED) {
			await this.prismaService.friendShip.create({
				data: { fromId, toId, status: true }
			})
			const key1 = `friends_${fromId}`
			if (await this.redisService.exist(key1)) {
				await this.redisService.sAdd(key1, [toId])
			}
			const key2 = `friends_${toId}`
			if (await this.redisService.exist(key2)) {
				await this.redisService.sAdd(key2, [fromId])
			}
		}
		return null
	}

	async getInvitations(id: string) {
		const invitations = await this.prismaService.friendRequest.findMany({
			where: {
				toId: id,
				status: FriendRequestStatus.PENDING,
			},
			select: { fromId: true, reason: true, id: true, }
		})
		return Promise.all(
			invitations.map(async inv => {
				const user = await this.prismaService.user.findUnique({
					where: { id: inv.fromId },
					select: { username: true, id: true, }
				})
				return {
					username: user.username,
					id: inv.id,
					reason: inv.reason,
				}
			})
		)
	}

	// 返回id对应用户的好友并返回，返回前把用户好友id列表写进缓存
  async getFriendship(id: string) {
    const idSet = new Set<string>()
    const list = await this.prismaService.friendShip.findMany({
      where: {
        AND: [{ status: true }, {OR: [{fromId: id}, {toId: id}]}]
      },
      select: {
        fromId: true, toId: true
      }
    })
    list.forEach(({ fromId, toId }) => { idSet.add(fromId); idSet.add(toId) })
		const result = [...idSet]
		const idx = result.findIndex(i => i === id)
		result.splice(idx, 1)
		const key = `friends_${id}`
		// console.log(key, result)
		if (result.length > 0 && !(await this.redisService.exist(key))) {
			await this.redisService.sAdd(key, result)
		}
    return result
  }
	async getStrangers(id: string) {
		const userIdsKey = 'users_ids'
		const existUserIds = await this.redisService.exist(userIdsKey)
		if (!existUserIds) {
			const userIds = (await this.prismaService.user.findMany()).map(i => i.id)
			await this.redisService.sAdd(userIdsKey, userIds)
			// console.log(userIds)
		}
		const userFriendIdsKey = `friends_${id}`
		const existUserFriendIds = await this.redisService.exist(userFriendIdsKey)
		if (!existUserFriendIds) {
			await this.getFriendship(id)
			// console.log(fs)
		}
		const userStrangersIdsKey = `strangers_${id}`
		await this.redisService.sDiffStore(userStrangersIdsKey, userIdsKey, userFriendIdsKey)
		const strangersIds = await this.redisService.sMembers(userStrangersIdsKey)
		// console.log(strangersIds)
		const idx = strangersIds.indexOf(id)
		if (idx !== -1) strangersIds.splice(idx, 1)
		return strangersIds
		// let UserFriendsIds = await this.redisService.get(`friends_${id}`)
		// if (!UserFriendsIds) {
		// 	await this.prismaService.
		// }
	}

	async remove({ id1, id2 }: { id1: string, id2: string }) {
		const targetFriendship = await this.prismaService.friendShip.findFirst({
			where: {OR:[{fromId: id1, toId: id2, },{fromId: id2, toId: id1, }]}
		})
		if (!targetFriendship) {
			throw new BadRequestException('找不到该好友关系')
		}
		if (!targetFriendship.status) {
			throw new BadRequestException('已经不是好友关系')
		}
		await this.prismaService.friendShip.update({
			where: { id: targetFriendship.id },
			data: { status: false }
		})
		const key1 = `friends_${id1}`
		if (await this.redisService.exist(key1)) {
			await this.redisService.sRem(key1, id2)
		}
		const key2 = `friends_${id2}`
		if (await this.redisService.exist(key2)) {
			await this.redisService.sRem(key2, id1)
		}
		return null
	}
}
