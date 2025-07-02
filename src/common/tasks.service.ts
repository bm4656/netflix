import { Injectable, Logger } from '@nestjs/common';
import { readdir, unlink } from 'fs/promises';
import { join, parse } from 'path';
import * as process from 'node:process';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from '../movie/entity/movie.entity';
import { Repository } from 'typeorm';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';

// 스케줄러 모듈로 분리 필요 -> 편의상 지금은 common 모듈에 포함
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  // @Cron('5 * * * * *')
  logEverySecond() {
    this.logger.fatal('FATAL 레벨 로그');
    this.logger.error('ERROR 레벨 로그');
    this.logger.warn('WARN 레벨 로그');
    this.logger.log('LOG 레벨 로그');
    this.logger.debug('DEBUG 레벨 로그');
    this.logger.verbose('VERBOSE 레벨 로그');
  }

  /**
   * 잉여 파일을 지우는 작업
   * @description
   * public/temp 디렉토리에서 잉여 파일을 찾아서 삭제하는 역할
   * 해당 디렉토리는 업로드된 파일들이 임시로 저장되는 곳 -> 실제 최종 업로드 되어야 진짜 저장소 /public/movie로 이동됨
   * 이 작업은 매 초마다 실행되며, public/temp 디렉토리의 파일 목록을 읽어와서 잉여 파일을 찾아 삭제
   * 파일명이 특정 패턴을 따르지 않거나, 24시간 이상 지난 파일들을 잉여 파일로 간주하여 삭제
   */
  @Cron('* * * * * *')
  async eraseOrphanFiles() {
    const files = await readdir(join(process.cwd(), 'public', 'temp'));

    const deleteFilesTargets = files.filter((file) => {
      const filename = parse(file).name; // 파일명에서 확장자를 제외한 부분

      const split = filename.split('_');

      if (split.length !== 2) {
        return true;
      }

      try {
        const date = +new Date(parseInt(split[split.length - 1]));
        const aDayInMilSec = 24 * 60 * 60 * 1000;

        const now = +new Date();

        return now - date > aDayInMilSec;
      } catch (e) {
        return true;
      }
    });

    await Promise.all(
      deleteFilesTargets.map((file) => unlink(join(process.cwd(), 'public', 'temp', file))),
    ).catch((e) => {
      console.error('파일 삭제 중 오류 발생:', e);
    });
  }

  @Cron('0 * * * * *')
  async calculateMovieLikeCounts() {
    await this.movieRepository.query(
      `update movie m
       set "likeCount" = (select count(*)
                          from movie_user_like mul
                          where "movieId" = m.id
                            and mul."isLike" = true);`,
    );

    await this.movieRepository.query(
      `update movie m
       set "dislikeCount" = (select count(*)
                             from movie_user_like mul
                             where "movieId" = m.id
                               and mul."isLike" = false);`,
    );
  }

  // @Cron('* * * * * *', {
  //   name: 'printer',
  // })
  // printer() {
  //   console.log('print every second');
  // }

  // @Cron('*/5 * * * * *')
  // stopper() {
  //   console.log('----stopper run----');
  //
  //   const job = this.schedulerRegistry.getCronJob('printer');
  //
  //   console.log('# Last Date');
  //   console.log(job.lastDate());
  //   console.log('# Next Date');
  //   console.log(job.nextDate());
  //   console.log('# Next Dates');
  //   console.log(job.nextDates(5));
  //
  //   if (job.isActive) {
  //     job.stop();
  //   } else {
  //     job.start();
  //   }
  // }
}
