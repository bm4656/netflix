import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MovieDetail } from './movie-detail.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Director } from '../../director/entity/director.entity';
import { Genre } from '../../genre/entity/genre.entity';
import { Transform } from 'class-transformer';
import { User } from '../../user/entity/user.entity';
import { MovieUserLike } from './movie-user-like.entity'; // ManyToOne Director -> 감독은 여러개의 영화를 만들 수 있다.

// ManyToOne Director -> 감독은 여러개의 영화를 만들 수 있다.
// OneToOne MovieDetail -> 영화는 하나의 상세정보를 가진다.
// ManyToMany Genre -> 영화는 여러개의 장르를 가질 수 있고 장르는 여러개의 영화에 속할 수 있다.

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.createMovies)
  creator: User;

  @Column({
    unique: true,
  })
  title: string;

  @Column()
  @Transform(({ value }) => `http://localhost:3000/${value}`)
  movieFilePath: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.movie, {
    cascade: true, // Create, Update, Delete 시 함께 처리
    nullable: false,
  })
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.movies, {
    cascade: true,
    nullable: false,
  })
  director: Director;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @Column({
    default: 0,
  })
  likeCount: number;

  @Column({
    default: 0,
  })
  dislikeCount: number;

  @ManyToMany(() => MovieUserLike, (mul) => mul.movie)
  likeUsers: MovieUserLike[];
}
