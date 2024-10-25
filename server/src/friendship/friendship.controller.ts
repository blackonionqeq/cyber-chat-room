import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { RequireLogin } from 'src/utils/decorator';
import { RequestFriendshipDto } from './dto/request-friendship.dto';
import { Request } from 'express';
import { FriendRequestStatus } from '@prisma/client';

@RequireLogin()
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  
  @Get('friendship')
  async getFriendship(@Req() req: Request) {
    return await this.friendshipService.getFriendship(req.user.id)
  }

  @Get('strangers')
  async getStrangers(@Req() req: Request) {
    return await this.friendshipService.getStrangers(req.user.id)
  }

  @Post('request')
  async request(@Body() data: RequestFriendshipDto, @Req() req: Request) {
    return await this.friendshipService.request({
      data, fromId: req.user.id,
    })
  }

  @Get('invitations')
  async getInvitations(@Req() req: Request) {
    return await this.friendshipService.getInvitations(req.user.id)
  }

  @Patch('agree/:id')
  async agree(@Param('id', ParseIntPipe) id: number) {
    return await this.friendshipService.changeRequestStatusById(id, FriendRequestStatus.APPROVED)
    // return await this.friendshipService.changeRequestStatus({
    //   fromId: id,
    //   toId: req.user.id,
    //   type: FriendRequestStatus.APPROVED
    // })
  }
  @Patch('reject/:id')
  async reject(@Param('id', ParseIntPipe) id: number) {
    return await this.friendshipService.changeRequestStatusById(id, FriendRequestStatus.REJECTED)
    // return await this.friendshipService.changeRequestStatus({
    //   toId: req.user.id,
    //   fromId: id,
    //   type: FriendRequestStatus.REJECTED
    // })
  }
  @Delete('remove/:id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    return await this.friendshipService.remove({ id1: id, id2: req.user.id, })
  }
}
