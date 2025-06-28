import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator((data: unknown, context: ExecutionContext): number => {
  const request = context.switchToHttp().getRequest();

  // if (!request || !request.user || !request.user.sub) {
  //   throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다!');
  // }

  return request?.user?.sub; // sub는 JWT에서 사용자 ID를 나타내는 표준 클레임
});
