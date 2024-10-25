import { BadRequestException, Inject, Injectable } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { md5 } from 'src/utils/crypto';
import { EmailService } from 'src/email/email.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private prismaService: PrismaService
  @Inject(RedisService)
  private redisService: RedisService
  @Inject(EmailService)
  private emailService: EmailService
  @Inject(JwtService)
  private jwtService: JwtService

  async create(data: RegisterUserDto) {
    const redisCaptcha = await this.redisService.get(`注册_captcha_${data.email}`)
    if (!redisCaptcha) {
      throw new BadRequestException('验证码已过期，请重新验证')
    }
    if (redisCaptcha !== data.captcha) {
      throw new BadRequestException('验证码错误')
    }
    const targetUser = await this.prismaService.user.findUnique({
      where: { username: data.username }
    })
    if (targetUser) {
      throw new BadRequestException('用户已存在')
    }
    return await this.prismaService.user.create({
      data: {
        username: data.username,
        password: md5(data.password),
        nickname: data.nickname,
        email: data.email,
      } as Prisma.UserCreateInput,
      select: { id: true, createTime: true }
    })
  }

  async generateCaptchaAndSend(address: string, type = '注册') {
    const code = Math.random().toString(36).slice(-6)
    await this.redisService.set(`${type}_captcha_${address}`, code, 300)
    await this.emailService.sendMail({
      to: address, subject: `${type}验证码`, html: `<p>你的${type}验证码是${code},有效期5分钟，请尽快使用。</p>`
    })
    return null
  }

  async login(data: LoginUserDto) {
    const target = await this.prismaService.user.findUnique({
      where: { username: data.username }
    })
    if (!target) {
      throw new BadRequestException('用户不存在')
    }
    if (target.password !== md5(data.password)) {
      throw new BadRequestException('密码错误')
    }
    return await this.getTokensByUser(target)
  }
  async getTokensByUser(user: Required<Prisma.UserCreateInput>) {

    return {
      accessToken: this.jwtService.sign({
        id: user.id,
        username: user.username,
      }),
      refreshToken: this.jwtService.sign({
        id: user.id,
      }, { expiresIn: '7d' })
    }
  }
  async refreshToken(token: string) {
    const {id} = this.jwtService.verify(token)
    const target = await this.prismaService.user.findUnique({
      where: { id }
    })
    return await this.getTokensByUser(target)
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    return await this.prismaService.user.findUnique({
      where: { id }
    })
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${updateUserDto} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
