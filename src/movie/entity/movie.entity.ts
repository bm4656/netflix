import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MovieDetail } from './movie-detail.entity';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Director } from '../../director/entity/director.entity'; // ManyToOne Director -> 감독은 여러개의 영화를 만들 수 있다.

// ManyToOne Director -> 감독은 여러개의 영화를 만들 수 있다.
// OneToOne MovieDetail -> 영화는 하나의 상세정보를 가진다.
// ManyToMany Genre -> 영화는 여러개의 장르를 가질 수 있고 장르는 여러개의 영화에 속할 수 있다.

@Entity()
export class Movie extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MovieDetail, (movieDetail) => movieDetail.id, {
    cascade: true, // Create, Update, Delete 시 MovieDetail도 함께 처리
  })
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(() => Director, (director) => director.id)
  director: Director;
}
