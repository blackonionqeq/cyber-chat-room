import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { Request } from 'express';
import { RequireLogin } from 'src/utils/decorator';

@RequireLogin()
@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Get('new-private-chat/:id')
  async createPrivateChat(@Param('id') id: string, @Req() req: Request) {
    return await this.chatroomService.createPrivateChat(id, req.user.id)
  }

  @Post('new-group-chat')
  async createGroupChat(@Body('ids') ids: string[], @Req() req: Request) {
    return await this.chatroomService.createGroupChat(ids.concat(req.user.id))
  }

  @Get('list')
  async list(@Req() req: Request) {
    return await this.chatroomService.list(req.user.id)
  }
  @Get('user-ids-by-room-id/:roomId')
  async getUserIds(@Param('roomId') roomId: string) {
    return await this.chatroomService.getUserIdsByRoomId(roomId)
  }
  @Patch('join')
  async joinRoom(@Query('roomId') roomId: string, @Req() req: Request, @Query('userId') userId?: string) {
    return await this.chatroomService.join(roomId, userId ?? req.user.id)
  }
  @Delete('quit/:roomId')
  async quitRoom(@Param('roomId') roomId: string, @Req() req: Request) {
    return await this.chatroomService.quit(roomId, req.user.id)
  }
}
