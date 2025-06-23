import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of, tap } from 'rxjs';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  // 데모를 위해 메모리에 저장, 실제 사용시 Redis 등 외부 캐시 사용 권장
  private readonly cache: Map<string, any> = new Map();

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const key = `${request.method}-${request.path}`;

    if (this.cache.has(key)) {
      // rxjs of 연산자를 사용하여 캐시된 데이터를 Observable로 변환
      return of(this.cache.get(key));
    }

    return next.handle().pipe(
      tap((response) => {
        // 캐시에 데이터 저장
        this.cache.set(key, response);
      }),
    );
  }
}
