import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { Observable } from 'rxjs';

type PickUser = Required<Pick<Prisma.UserCreateInput, 'id' | 'username'>>

declare module 'express' {
  interface Request {
    user: PickUser
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject()
  private reflector: Reflector

  @Inject(JwtService)
  private jwtService: JwtService

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest()

    const requiredLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(), context.getHandler()
    ])
    if (!requiredLogin) return true

    const authorization = request.headers.authorization
    if (!authorization) {
      throw new UnauthorizedException('请先登录')
    }
    try {
      const token = authorization.split(' ')[1] ?? authorization
      const data = this.jwtService.verify<PickUser>(token)
      request.user = {...data}
      return true
    } catch {
      throw new UnauthorizedException('身份令牌过期，请重新登录')
    }
  }
}
