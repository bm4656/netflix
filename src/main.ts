import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.enableVersioning({
    type: VersioningType.MEDIA_TYPE,
    key: 'v=',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      // 기본값 false, true로 설정하면 DTO에 정의되지 않은 값들은 전달되지 않는다.(원래는 들어가버림)
      whitelist: true,
      // 기본값 false, true로 설정하면 정의되지 않은 값들에 대해 예외를 발생시킨다.
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
