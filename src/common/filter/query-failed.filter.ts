import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // QueryFailedError는 TypeORM에서 가져오는데 그 안에 getStatus()가 없으므로 400으로 설정
    // 클라이언트에서 잘못된 값을 넣었기 때문에 데이터베이스 에러가 난다고 생각해 400
    const status = 400;

    let message = '데이터베이스 에러 발생!';

    if (exception.message.includes('duplicate key')) {
      message = '중복된 키 에러!';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
