import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  parseBasicToken(rawToken: string) {
    const baseSplit = rawToken.split(' ');

    if (baseSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다!');
    }

    const [_, token] = baseSplit;
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const tokenSplit = decoded.split(':');

    if (tokenSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못되었습니다!');
    }

    const [email, password] = tokenSplit;

    return {
      email,
      password,
    };
  }

  async register(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user) {
      throw new BadRequestException('이미 가입한 이메일입니다!');
    }

    const hash = await bcrypt.hash(password, this.configService.get<number>('HASH_ROUNDS'));

    return await this.userRepository.save({
      email,
      password: hash,
    });
  }

  async authenticate(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('등록되지 않는 이메일입니다!');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException('비밀번호가 일치하지 않습니다!');
    }

    return user;
  }

  async issueToken(user: User, isRefreshToken: boolean) {
    const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    const accessTokenSecret = this.configService.get<string>('ACCESS_TOKEN_SECRET');

    return this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: isRefreshToken ? 'refresh' : 'access',
      },
      {
        secret: isRefreshToken ? refreshTokenSecret : accessTokenSecret,
        expiresIn: isRefreshToken ? '24h' : 300,
      },
    );
  }

  async login(rawToken: string) {
    const { email, password } = this.parseBasicToken(rawToken);

    const user = await this.authenticate(email, password);

    return {
      refreshToken: await this.issueToken(user, true),
      accessToken: await this.issueToken(user, false),
    };
  }
}
