import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { Movie } from './entity/movie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from '../director/entity/director.entity';
import { Genre } from '../genre/entity/genre.entity';
import { CommonModule } from '../common/common.module';
import { MovieUserLike } from './entity/movie-user-like.entity';
import { User } from '../user/entity/user.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, MovieDetail, MovieUserLike, Director, Genre, User]),
    CommonModule,
    CacheModule.register({
      ttl: 3000, // 모듈 단위에서 ttl 설정 -> 서비스 단에서도 설정하면 우선순위는 더 상세한 쪽으로 감
    }),
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
