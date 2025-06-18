import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { envVariableKeys } from '../../common/const/env.const';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BearerTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      next();
      return;
    }

    try {
      const token = await this.validateBearerToken(authHeader);

      const decodedPayload = await this.jwtService.decode(token);

      if (decodedPayload.type !== 'access' && decodedPayload.type !== 'refresh') {
        throw new BadRequestException('잘못된 토큰입니다!');
      }

      const secretKey =
        decodedPayload.type === 'refresh'
          ? envVariableKeys.refreshTokenSecret
          : envVariableKeys.accessTokenSecret;

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>(secretKey),
      });

      req.user = payload;
      next();
    } catch (e) {
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
