import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Exclude } from 'class-transformer';
import { Movie } from '../../movie/entity/movie.entity';

export enum Role {
  admin,
  paidUser,
  user,
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    enum: Role,
    default: Role.user,
  })
  role: Role;

  @OneToMany(() => Movie, (movie) => movie.creator)
  createMovies: Movie[];
}
