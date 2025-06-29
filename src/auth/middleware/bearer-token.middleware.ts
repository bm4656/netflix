import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { envVariableKeys } from '../../common/const/env.const';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      next();
      return;
    }

    const token = await this.validateBearerToken(authHeader);

    const blockToken = await this.cacheManager.get(`block-token:${token}`);
    if (blockToken) {
      throw new UnauthorizedException('차단된 토큰입니다!');
    }

    const tokenKey = `token:${token}`;
    const cachedPayload = await this.cacheManager.get(tokenKey);

    if (cachedPayload) {
      req.user = cachedPayload;
      return next();
    }

    const decodedPayload = await this.jwtService.decode(token);

    if (decodedPayload.type !== 'access' && decodedPayload.type !== 'refresh') {
      throw new BadRequestException('잘못된 토큰입니다!');
    }

    try {
      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariableKeys.refreshTokenSecret
          : envVariableKeys.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey),
      });

      // payload['exp'] -> epoch time seconds
      const expiryDate = +new Date(payload['exp'] * 1000);
      const now = +new Date();

      const differenceInSeconds = (expiryDate - now) / 1000;

      await this.cacheManager.set(tokenKey, payload, Math.max(differenceInSeconds - 30, 1) * 1000);

      req.user = payload;
      next();
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('토큰이 만료되었습니다!');
      }
      next();
    }
  }

  private async validateBearerToken(rawToken: string) {
    const basicSplit = rawToken.split(' ');

    if (basicSplit.length !== 2) {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    const [bearer, token] = basicSplit;

    if (bearer.toLowerCase() !== 'bearer') {
      throw new BadRequestException('토큰 포맷이 잘못됐습니다!');
    }

    return token;
  }
}
