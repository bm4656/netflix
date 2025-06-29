import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MovieModule } from './movie/movie.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movie/entity/movie.entity';
import { MovieDetail } from './movie/entity/movie-detail.entity';
import { DirectorModule } from './director/director.module';
import { Director } from './director/entity/director.entity';
import { GenreModule } from './genre/genre.module';
import { Genre } from './genre/entity/genre.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { User } from './user/entity/user.entity';
import { envVariableKeys } from './common/const/env.const';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { AuthGuard } from './auth/guard/auth.guard';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RBACGuard } from './auth/guard/rbac.guard';
import { ResponseTimeInterceptor } from './common/interceptor/response-time.interceptor';
import { ForbiddenFilter } from './common/filter/forbidden.filter';
import { QueryFailedFilter } from './common/filter/query-failed.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MovieUserLike } from './movie/entity/movie-user-like.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ConfigModule을 전역 모듈로 설정
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('postgres').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>(envVariableKeys.dbType) as 'postgres',
        host: configService.get<string>(envVariableKeys.dbHost),
        port: configService.get<number>(envVariableKeys.dbPort),
        username: configService.get<string>(envVariableKeys.dbUsername),
        password: configService.get<string>(envVariableKeys.dbPassword),
        database: configService.get<string>(envVariableKeys.dbDatabase),
        entities: [Movie, MovieDetail, MovieUserLike, Director, Genre, User],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'), // 피일을 찾는 경로
      serveRoot: '/public/', // 위 경로의 파일을 가져오려면 이 서브루트를 앞에 붙여라
    }),
    CacheModule.register({
      // 모듈 단위에서 ttl 설정 -> 서비스 단에서도 설정하면 우선순위는 더 상세한 쪽으로 감
      ttl: 0,
      isGlobal: true,
    }),
    MovieModule,
    DirectorModule,
    GenreModule,
    UserModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RBACGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ForbiddenFilter,
    },
    {
      provide: APP_FILTER,
      useClass: QueryFailedFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude(
        {
          path: 'auth/login',
          method: RequestMethod.POST,
        },
        {
          path: 'auth/register',
          method: RequestMethod.POST,
        },
      )
      .forRoutes('*');
  }
}
