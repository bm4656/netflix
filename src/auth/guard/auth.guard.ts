import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorator/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 만약 public 데코레이터가 붙어있으면 모든 로직을 bypass한다.
    // @Public() 괄호 안의 값을 반환한다. 없다면 undefined를 반환한다.
    const isPublic = this.reflector.get(Public, context.getHandler());

    if (isPublic) {
      return true;
    }

    // 요청에서 user 객체가 존재하는지 확인한다.
    const request = context.switchToHttp().getRequest();

    // user 객체가 없으면 접근을 허용하지 않는다.
    if (!request.user || request.user.type !== 'access') {
      return false;
    }
    // user 객체가 존재하면 접근을 허용한다.
    return true;
  }
}
