import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { FriendshipModule } from './friendship/friendship.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { ChatModule } from './chat/chat.module';
import { PrismaMongoModule } from './prisma-mongo/prisma-mongo.module';
import { ChatContentModule } from './chat-content/chat-content.module';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [PrismaModule, UserModule, RedisModule, EmailModule, JwtModule.registerAsync({
    global: true,
    useFactory: () => ({
      secret: 'shidi666',
      signOptions: { expiresIn: '30m' }
    })
  }), FriendshipModule, ChatroomModule, ChatModule, PrismaMongoModule, ChatContentModule, FavoriteModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
})
export class AppModule {}
