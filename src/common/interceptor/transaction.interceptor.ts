import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { DataSource } from 'typeorm';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly dataSource: DataSource) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    req.queryRunner = queryRunner; // 쿼리 러너를 요청 객체에 저장하여 이후 서비스에서 사용

    return next.handle().pipe(
      catchError(async (error) => {
        await queryRunner.rollbackTransaction();
        await queryRunner.release();

        throw error;
      }),
      tap(async () => {
        await queryRunner.commitTransaction();
        await queryRunner.release();
      }),
    );
  }
}
