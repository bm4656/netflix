import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entity/user.entity';

const mockUserRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          // getRepositoryToken(model): TypeORM에서 해당 모델의 레포지토리를 가져오는 함수
          // Module에서 TypeORM.forFeature([User])와 같은 역할을 함
          provide: getRepositoryToken(User),
          useValue: mockUserRepository, // 해당 레포지토리로 대체해서 사용하도록 설정
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
