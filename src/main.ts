import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
  });

  const config = new DocumentBuilder()
    .setTitle('NestJS Netflix API')
    .setDescription('코드팩토리 NestJS 강의')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('doc', app, document);

  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
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
