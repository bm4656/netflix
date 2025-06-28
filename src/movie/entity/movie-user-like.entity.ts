import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Movie } from './movie.entity';

@Entity()
export class MovieUserLike {
  @PrimaryColumn({
    name: 'movieId',
    type: 'int8',
  })
  @ManyToOne(() => Movie, (movie) => movie.likeUsers)
  movie: Movie;

  @PrimaryColumn({
    name: 'userId',
    type: 'int8',
  })
  @ManyToOne(() => User, (user) => user.likeMovies)
  user: User;

  @Column()
  isLike: boolean;
}
