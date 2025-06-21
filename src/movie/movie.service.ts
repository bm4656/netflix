import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from '../director/entity/director.entity';
import { Genre } from '../genre/entity/genre.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from '../common/common.service';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly dataSource: DataSource,
    private readonly commonService: CommonService,
  ) {}

  async findAll(dto: GetMoviesDto) {
    const { title, page, take } = dto;

    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .leftJoinAndSelect('movie.director', 'director')
      .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', { title: `%${title}%` });
    }

    if (take && page) {
      this.commonService.applyPagePaginationParamsToQb(qb, dto);
    }

    return qb.getManyAndCount();

    // if (!title) {
    //   return [
    //     await this.movieRepository.find({
    //       relations: ['director'],
    //     }),
    //     await this.movieRepository.count(),
    //   ];
    // }
    //
    // return this.movieRepository.findAndCount({
    //   where: { title: Like(`%${title}%`) },
    //   relations: ['director'],
    // });
  }

  async findOne(id: number) {
    const movie = this.movieRepository.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    return movie;
  }

  async create(createMovieDto: CreateMovieDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const director = await queryRunner.manager.findOne(Director, {
        where: { id: createMovieDto.directorId },
      });

      if (!director) {
        throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
      }

      const genres = await queryRunner.manager.find(Genre, {
        where: {
          id: In(createMovieDto.genreIds),
        },
      });

      if (genres.length !== createMovieDto.genreIds.length) {
        throw new NotFoundException(
          `존재하지 않는 장르가 포함되어 있습니다! 존재하는 장르 ids -> ${genres.map((genre) => genre.id).join(', ')}`,
        );
      }

      const movieDetail = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(MovieDetail)
        .values({ detail: createMovieDto.detail })
        .execute();

      const movieDetailId = movieDetail.identifiers[0].id;

      const movie = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Movie)
        .values({
          title: createMovieDto.title,
          detail: { id: movieDetailId },
          director,
        })
        .execute();

      const movieId = movie.identifiers[0].id;

      await queryRunner.manager
        .createQueryBuilder()
        .relation(Movie, 'genres')
        .of(movieId)
        .add(genres.map((genre) => genre.id));

      // const movie = await this.movieRepository.save({
      //   title: createMovieDto.title,
      //   detail: {
      //     detail: createMovieDto.detail,
      //   },
      //   director,
      //   genres,
      // });

      await queryRunner.commitTransaction();

      return this.movieRepository.findOne({
        where: { id: movieId },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException(e.message || '영화 생성 중 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const movie = await queryRunner.manager.findOne(Movie, {
        where: { id },
        relations: ['detail', 'genres'],
      });

      if (!movie) {
        throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
      }

      const { detail, directorId, genreIds, ...MovieRest } = updateMovieDto;

      let newDirector;

      if (directorId) {
        const director = await queryRunner.manager.findOne(Director, {
          where: { id: directorId },
        });

        if (!director) {
          throw new NotFoundException('존재하지 않는 ID의 감독입니다.');
        }

        newDirector = director;
      }

      let newGenres;

      if (genreIds) {
        const genres = await queryRunner.manager.find(Genre, {
          where: {
            id: In(genreIds),
          },
        });

        if (genres.length !== genreIds.length) {
          throw new NotFoundException(
            `존재하지 않는 장르가 포함되어 있습니다! 존재하는 장르 ids -> ${genres.map((genre) => genre.id).join(', ')}`,
          );
        }

        newGenres = genres;
      }

      const movieUpdateFields = {
        ...MovieRest,
        ...(newDirector && { director: newDirector }),
      };

      await queryRunner.manager
        .createQueryBuilder()
        .update(Movie)
        .set(movieUpdateFields)
        .where('movie.id = :id', { id })
        .execute();

      // await this.movieRepository.update({ id }, movieUpdateFields);

      if (detail) {
        await queryRunner.manager
          .createQueryBuilder()
          .update(MovieDetail)
          .set({ detail })
          .where('movieDetail.id = :id', { id: movie.detail.id })
          .execute();

        // await this.movieDetailRepository.update(
        //   {
        //     id: movie.detail.id,
        //   },
        //   {
        //     detail,
        //   },
        // );
      }

      if (newGenres) {
        await queryRunner.manager
          .createQueryBuilder()
          .relation(Movie, 'genres')
          .of(id)
          .addAndRemove(
            newGenres.map((genre) => genre.id),
            movie.genres.map((genre) => genre.id),
          );
      }

      // const newMovie = await this.movieRepository.findOne({
      //   where: { id },
      //   relations: ['detail', 'director'],
      // });
      //
      // newMovie.genres = newGenres;
      //
      // await this.movieRepository.save(newMovie);

      await queryRunner.commitTransaction();

      return this.movieRepository.findOne({
        where: { id },
        relations: ['detail', 'director', 'genres'],
      });
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException(e.message || '영화 수정 중 오류가 발생했습니다.');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['detail'],
    });

    if (!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다.');
    }

    await this.movieRepository
      .createQueryBuilder('movie')
      .delete()
      .where('id = :id', { id })
      .execute();
    // await this.movieRepository.delete(id);
    await this.movieDetailRepository.delete(movie.detail.id);

    return id;
  }
}
