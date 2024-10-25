import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PrismaMongoClient } from '@prisma/mongo-client';

@Injectable()
export class PrismaMongoService extends PrismaMongoClient implements OnModuleInit {
	constructor() {
		super({
			log: [{ emit: 'stdout', level: 'query' }]
		})
	}
	async onModuleInit() {
		await this.$connect()
	}
}
