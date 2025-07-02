import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

// 스케줄러 모듈로 분리 필요 -> 편의상 지금은 common 모듈에 포함
@Injectable()
export class TasksService {
  constructor() {}

  @Cron('* * * * * *')
  logEverySecond() {
    console.log('매 초마다 실행되는 작업입니다.');
  }
}
