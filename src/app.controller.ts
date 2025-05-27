import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('movie')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('')
  getMovies() {
    return [
      {
        id: 1,
        name: '해리포터',
        character: ['해리포터', '헤르미온느'],
      },
      {
        id: 2,
        name: '트와일라잇',
        character: ['벨라', '애드워드'],
      },
    ];
  }

  @Get(':id')
  getMovie() {
    return {
      id: 1,
      name: '해리포터',
      character: ['해리포터', '헤르미온느'],
    };
  }

  @Post()
  postMovie() {
    return {
      id: 3,
      name: '어벤져스',
      character: ['아이언맨', '토르'],
    };
  }

  @Patch(':id')
  patchMovie() {
    return {
      id: 3,
      name: '어벤져스',
      character: ['아이언맨', '블랙위도우'],
    };
  }

  @Delete(':id')
  deleteMovie() {
    return 3;
  }
}
