import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req,  } from '@nestjs/common';
import { UserService } from './user.service';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RequireLogin } from 'src/utils/decorator';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    // delete registerUserDto.captcha
    return this.userService.create(registerUserDto);
  }

  @Get('register-captcha')
  async registerCaptcha(@Query('address') address: string) {
    return await this.userService.generateCaptchaAndSend(address, '注册')
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return await this.userService.login(loginUserDto)
  }

  @Get('refresh/:refreshToken')
  async refreshToken(@Param('refreshToken') refreshToken: string) {
    return await this.userService.refreshToken(refreshToken)
  }

  @Get(':id')
  async getUserInfo(@Param('id') id: string) {
    return await this.userService.findOne(
      id
    )
  }
  @Get('')
  @RequireLogin()
  async getSelfInfo(@Req() req: Request) {
    return await this.userService.findOne(req.user.id)
  }


  // @Get()
  // findAll() {
  //   return this.userService.findAll();
  // }


  @Patch(':id')
  @RequireLogin()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}