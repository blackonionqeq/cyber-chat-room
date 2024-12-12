import { Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import type { Request } from 'express';
import { RequireLogin } from 'src/utils/decorator';

@RequireLogin()
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get('list')
  async list(@Req() req: Request) {
    return await this.favoriteService.list(req.user.id)
  }
  @Post('add/:chatContentId')
  async add(@Param('chatContentId') cId: string, @Req() req: Request) {
    return await this.favoriteService.add(cId, req.user.id)
  }
  @Delete(':fId')
  async remove(@Param('fId') fId: string) {
    return await this.favoriteService.remove(fId)
  }
}
