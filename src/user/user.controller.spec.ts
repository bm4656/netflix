import { UserController } from './user.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('create', () => {
    const createUserDto = {
      email: 'test@test.ai',
      password: '123123',
    };

    const user = {
      id: 1,
      ...createUserDto,
      password: 'hashedPasswordhashshshshsh',
    };

    it('should create a new user and return correct value', async () => {
      jest.spyOn(mockUserService, 'create').mockResolvedValue(user);

      const result = await userController.create(createUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const users = [
        {
          id: 1,
          email: 'test@test.ai',
        },
        {
          id: 2,
          email: 'test@test.ai',
        },
      ];

      jest.spyOn(mockUserService, 'findAll').mockResolvedValue(users);

      const result = await userController.findAll();

      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = {
        id: 1,
        email: 'test@test.ai',
      };

      jest.spyOn(mockUserService, 'findOne').mockResolvedValue(user);

      const result = await userController.findOne(1);

      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should return the updated user', async () => {
      const id = 1;
      const updateUserDto: UpdateUserDto = {
        email: 'test@test.ai',
      };

      const user = {
        id,
        ...updateUserDto,
      };

      jest.spyOn(mockUserService, 'update').mockResolvedValue(user);

      const result = await userController.update(id, updateUserDto);

      expect(mockUserService.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(result).toEqual(user);
    });
  });
  describe('remove', () => {
    it('should return a removed id', async () => {
      const id = 1;

      jest.spyOn(mockUserService, 'remove').mockResolvedValue(id);

      const result = await userController.remove(id);

      expect(mockUserService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(id);
    });
  });
});
