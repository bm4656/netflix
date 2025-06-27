import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        // ......../netflix/public/movie
        // mac : process.cwd() + '/public' + '/movie'
        // windows : process.cwd() + '\public' + '\movie'
        // 위와 같이 경로를 지정하면 운영체제에 따라 다르게 동작할 수 있으므로 join을 사용
        destination: join(process.cwd(), 'public', 'temp'),
        filename: function (
          req: Express.Request,
          file: Express.Multer.File,
          callback: (error: Error | null, filename: string) => void,
        ) {
          const split = file.originalname.split('.');

          let extension = 'mp4';

          if (split.length > 1) {
            extension = split[split.length - 1];
          }

          callback(null, `${v4()}_${Date.now()}.${extension}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
