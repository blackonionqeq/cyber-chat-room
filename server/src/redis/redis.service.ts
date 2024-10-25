import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
	@Inject('REDIS_CLIENT')
	private redisClient: RedisClientType

	async get(key: string) {
		return await this.redisClient.get(key)
	}
	async set(key: string, value: string | number, ttl?: number) {
		await this.redisClient.set(key, value)

		if (ttl) {
			await this.redisClient.expire(key, ttl)
		}
	}
	async sAdd(key: string, members: string[]) {
		await this.redisClient.sAdd(key, members)
	}
	async sRem(key: string, members: string[]|string) {
		await this.redisClient.sRem(key, members)
	}
	async sMembers(key: string) {
		return await this.redisClient.sMembers(key)
	}
	async sIsMember(key: string, member: string) {
		return await this.redisClient.sIsMember(key, member)
	}
	async exist(key: string) {
		return (await this.redisClient.exists(key)) > 0
	}
	async sDiffStore(newSetKey: string, key1: string, key2: string) {
		return await this.redisClient.sDiffStore(newSetKey, [key1, key2])
	}
	async sInterStore(newSetKey: string, key1: string, key2: string) {
		return await this.redisClient.sInterStore(newSetKey, [key1, key2])
	}
}
