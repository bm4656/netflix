import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create.movie.dto';
import { UpdateMovieDto } from './dto/update.movie.dto';
import { Movie } from './entity/movie.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepositry: Repository<Movie>,
  ) {}

  async getMovies(title: string) {
    if (!title) {
      return [
        await this.movieRepositry.find(),
        await this.movieRepositry.count(),
      ];
    }

    return this.movieRepositry.findAndCount({
      where: { title: Like(`%${title}%`) },
    });
  }

  async getMovieById(id: number) {
    const movie = this.movieRepositry.findOne({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    return movie;
  }

  async createMovie(createMovieDto: CreateMovieDto) {
    const movie = this.movieRepositry.save(createMovieDto);

    return movie;
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = this.movieRepositry.findOne({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    await this.movieRepositry.update({ id }, updateMovieDto);

    const newMovie = await this.movieRepositry.findOne({
      where: { id },
    });

    return newMovie;
  }

  async deleteMovie(id: number) {
    const movie = this.movieRepositry.findOne({
      where: { id },
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    await this.movieRepositry.delete(id);

    return id;
  }
}
