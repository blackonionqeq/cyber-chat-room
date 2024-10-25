import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [RedisService, {
    provide: 'REDIS_CLIENT',
    async useFactory() {
      return await createClient({
        socket: {
          host: 'localhost',
          port: 6379
        },
        database: 2,
      }).connect()
    },
  }],
  exports: [RedisService]
})
export class RedisModule {}
