import { GenreController } from './genre.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { Genre } from './entity/genre.entity';

const mockGenreService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('GenreController', () => {
  let genreController: GenreController;
  let genreService: GenreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenreController],
      providers: [
        {
          provide: GenreService,
          useValue: mockGenreService,
        },
      ],
    }).compile();

    genreController = module.get<GenreController>(GenreController);
    genreService = module.get<GenreService>(GenreService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(genreController).toBeDefined();
  });

  describe('create', () => {
    it('should call genreService.create with correct parameter', () => {
      const createGenreDto = {
        name: 'Fantasy',
      };
      const result = { id: 1, ...createGenreDto };

      jest.spyOn(genreService, 'create').mockResolvedValue(result as CreateGenreDto & Genre);

      expect(genreController.create(createGenreDto)).resolves.toEqual(result);
      expect(genreService.create).toHaveBeenCalledWith(createGenreDto);
    });
  });
  describe('findAll', () => {
    it('should call genreService.findAll and return an array of genres', async () => {
      const result = [
        {
          id: 1,
          name: 'Fantasy',
        },
      ];

      jest.spyOn(genreService, 'findAll').mockResolvedValue(result as Genre[]);

      expect(genreController.findAll()).resolves.toEqual(result);
      expect(genreService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should call genreService.findOne with correct id and return the genre', () => {
      const id = 1;
      const result = {
        id: 1,
        name: 'Fantasy',
      };

      jest.spyOn(genreService, 'findOne').mockResolvedValue(result as Genre);

      expect(genreController.findOne(id)).resolves.toEqual(result);
      expect(genreService.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should call genreService.update with correct parameters and return updated genre', () => {
      const id = 1;
      const updateGenreDto = {
        name: 'Fantasy 2',
      };
      const result = { id: 1, ...updateGenreDto };

      jest.spyOn(genreService, 'update').mockResolvedValue(result as Genre);

      expect(genreController.update(id, updateGenreDto)).resolves.toEqual(result);
      expect(genreService.update).toHaveBeenCalledWith(id, updateGenreDto);
    });
  });

  describe('remove', () => {
    it('should call genreService.remove with correct id and return id of the removed genre', () => {
      const id = 1;

      jest.spyOn(genreService, 'remove').mockResolvedValue(id);

      expect(genreController.remove(id)).resolves.toBe(id);
      expect(genreService.remove).toHaveBeenCalledWith(id);
    });
  });
});
