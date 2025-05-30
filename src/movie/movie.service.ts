import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create.movie.dto';
import { UpdateMovieDto } from './dto/update.movie.dto';

export interface Movie {
  id: number;
  title: string;
  genre: string;
}

@Injectable()
export class MovieService {
  private movies: Movie[] = [
    {
      id: 1,
      title: '해리포터',
      genre: '판타지',
    },
    {
      id: 2,
      title: '트와일라잇',
      genre: '로맨스',
    },
  ];
  private idCounter = 3;

  getMovies(title: string) {
    {
      if (!title) {
        return this.movies;
      }

      return this.movies.filter((movie) => movie.title.startsWith(title));
    }
  }

  getMovieById(id: number) {
    const movie = this.movies.find((movie) => movie.id === id);
    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }
    return movie;
  }

  createMovie(createMovieDto: CreateMovieDto) {
    const movie: Movie = {
      id: this.idCounter++,
      ...createMovieDto,
    };

    this.movies.push(movie);
    return movie;
  }

  updateMovie(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = this.movies.find((movie) => movie.id === id);

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    Object.assign(movie, updateMovieDto);
    return movie;
  }

  deleteMovie(id: number) {
    const movieIndex = this.movies.findIndex(
      (movie) => movie.id === Number(id),
    );

    if (movieIndex === -1) {
      throw new NotFoundException('존재하지 않는 ID 값의 영화입니다.');
    }

    this.movies.splice(movieIndex, 1);
    return id;
  }
}
