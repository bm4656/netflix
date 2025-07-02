import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class DefaultLogger extends ConsoleLogger {
  warn(message: unknown, ...rest: unknown[]) {
    super.warn(message, ...rest);
    // 알림 발송 or 파일 기록 등 추가 작업
  }

  error(message: any, ...rest: unknown[]) {
    super.error(message, ...rest);
  }
}
