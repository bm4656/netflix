import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('common')
export class CommonController {
  @Post('video')
  @UseInterceptors(
    FileInterceptor('movie', {
      limits: {
        fileSize: 1024 * 1024 * 100, // 100MB
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = ['video/mp4', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(new BadRequestException('Invalid file type'), false);
        }
        callback(null, true);
      },
    }),
  )
  createVideo(@UploadedFile() movie: Express.Multer.File) {
    return {
      fileName: movie.filename,
    };
  }
}
