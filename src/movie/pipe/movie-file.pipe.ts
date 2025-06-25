import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { rename } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class MovieFilePipe
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
  constructor(
    private readonly options: {
      // MB로 입력
      maxSize: number;
      mimeType: string;
    },
  ) {}

  async transform(
    value: Express.Multer.File,
    metadata: ArgumentMetadata,
  ): Promise<Express.Multer.File> {
    if (!value) {
      throw new BadRequestException('movie 필드는 필수입니다!');
    }

    const byteSize = this.options.maxSize * 1024 * 1024; // MB to Bytes

    if (value.size > byteSize) {
      throw new BadRequestException(`파일 크기는 ${this.options.maxSize}MB를 초과할 수 없습니다.`);
    }

    if (value.mimetype !== this.options.mimeType) {
      throw new BadRequestException(`파일 타입은 ${this.options.mimeType}이어야 합니다.`);
    }

    const split = value.originalname.split('.');

    let extension = 'mp4';

    if (split.length > 1) {
      extension = split[split.length - 1];
    }

    const filename = `${value.filename}_${Date.now()}.${extension}`;
    const newPath = join(value.destination, filename);

    await rename(value.path, newPath);

    return {
      ...value,
      filename,
    };
  }
}
