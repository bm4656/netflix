import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { delay, Observable, tap } from 'rxjs';

@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const reqTime = Date.now();

    return next.handle().pipe(
      delay(1000),
      tap(() => {
        const resTime = Date.now();
        const diff = resTime - reqTime;

        if (diff > 1000) {
          console.log(`!!!TIMEOUT!!! [${req.method} ${req.path}] ${diff}ms`);

          throw new InternalServerErrorException(
            '서버 응답 시간이 너무 깁니다. 잠시 후 다시 시도해주세요.',
          );
        } else {
          console.log(`[${req.method} ${req.path}] ${diff}ms`);
        }
      }),
    );
  }
}
