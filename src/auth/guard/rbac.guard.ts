import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../user/entity/user.entity';
import { RBAC } from '../decorator/rbac.decorator';

@Injectable()
export class RBACGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // @RBAC 데코레이터에 설정된 ROLE ENUM 값을 가져옴
    const role = this.reflector.get<Role>(RBAC, context.getHandler());

    // ROLE ENUM에 해당하는 값이 데코레이터에 들어갔는지 확인
    if (!Object.values(Role).includes(role)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    // AuthGuard 통과했는지 한 번 더 검증
    if (!user) {
      return false;
    }

    return user.role <= role;
  }
}
