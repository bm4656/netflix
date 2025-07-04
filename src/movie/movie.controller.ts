import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from '../user/entity/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { UserId } from '../user/decorator/user-id.decorator';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Throttle } from '../common/decorator/throttle.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('movie')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Public()
  @Get()
  @Throttle({
    count: 5,
    unit: 'minute',
  })
  getMovies(@Query() dto: GetMoviesDto, @UserId() userId: number) {
    return this.movieService.findAll(dto, userId);
  }

  // CacheManager의 CacheInterceptor 사용 -> 자동으로 엔드포인트의 결과를 캐싱한다.
  // CacheInterceptor는 기본적으로 메모리 캐시를 사용하며, TTL(Time To Live)을 설정할 수 있다.
  // CacheInterceptor는 url과 쿼리 파라미터를 기반으로 캐시 키를 생성한다.
  @Get('recent')
  @UseInterceptors(CacheInterceptor)
  // @CacheKey('movies-recent') // CacheKey을 사용하여 캐시 키를 명시적으로 설정할 수 있다. -> 쿼리가 변경되어도 같은 키 값에 캐시가 저장된다.
  // @CacheTTL(1000)
  getMoviesRecent() {
    return this.movieService.findRecent();
  }

  @Public()
  @Get(':id')
  getMovie(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.movieService.findOne(id);
  }

  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  @Post()
  postMovie(
    @Body() body: CreateMovieDto,
    @QueryRunner() queryRunner: QR,
    @UserId() userId: number,
  ) {
    return this.movieService.create(body, userId, queryRunner);
  }

  @RBAC(Role.admin)
  @Patch(':id')
  patchMovie(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateMovieDto) {
    return this.movieService.update(id, body);
  }

  @RBAC(Role.admin)
  @Delete(':id')
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }

  @Post(':id/like')
  createMovieLike(@Param('id', ParseIntPipe) movieId: number, @UserId() userId: number) {
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }

  @Post(':id/dislike')
  createMovieDislike(@Param('id', ParseIntPipe) movieId: number, @UserId() userId: number) {
    return this.movieService.toggleMovieLike(movieId, userId, false);
  }
}
