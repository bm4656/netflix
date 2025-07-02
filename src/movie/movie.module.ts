import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController, MovieController2 } from './movie.controller';
import { Movie } from './entity/movie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from '../director/entity/director.entity';
import { Genre } from '../genre/entity/genre.entity';
import { CommonModule } from '../common/common.module';
import { MovieUserLike } from './entity/movie-user-like.entity';
import { User } from '../user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie, MovieDetail, MovieUserLike, Director, Genre, User]),
    CommonModule,
  ],
  controllers: [MovieController2, MovieController],
  providers: [MovieService],
})
export class MovieModule {}
