import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateDirectorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsDateString()
  @IsOptional()
  dob?: Date;

  @IsString()
  @IsOptional()
  nationality?: string;
}
