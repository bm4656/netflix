import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PagePaginationDto } from './dto/page-pagination.dto';
import { CursorPaginationDto } from './dto/cursor-pagination.dto';

@Injectable()
export class CommonService {
  constructor() {}

  applyPagePaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: PagePaginationDto) {
    const { page, take } = dto;

    const skip = take * (page - 1);

    qb.take(take);
    qb.skip(skip);
  }

  async applyCursorPaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: CursorPaginationDto) {
    const { cursor, order, take } = dto;

    if (cursor) {
    }

    for (let i = 0; i < order.length; i++) {
      const [column, direction] = order[i].split('_');

      if (direction !== 'ASC' && direction !== 'DESC') {
        throw new Error(`Order는 ASC 또는 DESC만 허용됩니다. 현재: ${direction}`);
      }

      if (i === 0) {
        qb.orderBy(`${qb.alias}.${column}`, direction);
      } else {
        qb.addOrderBy(`${qb.alias}.${column}`, direction);
      }
    }

    qb.take(take);

    const results = await qb.getMany();

    const nextCursor = this.generateNextCursor(results, order);

    return { qb, nextCursor };
  }

  // FE에서 BE에서 보내준 마지막 데이터를 기반으로 커서를 만들어서 보내줘야하는데
  // 우리는 BE에서 커서를 생성해서 보내줄 것이다. -> 우리도 마지막 데이터를 가지고 있어야한다.
  generateNextCursor<T>(results: T[], order: string[]): string | null {
    if (results.length === 0) {
      return null; // 결과가 없으면 커서를 생성할 필요 없음
    }

    /**
     * {
     *   values:{
     *     id:30 ...
     *   },
     *   order: [ 'id_DESC', 'likeCount_DESC' ]
     * }
     */
    const lastItem = results[results.length - 1];
    const values = {};

    order.forEach((columnOrder) => {
      const [column] = columnOrder.split('_');
      values[column] = lastItem[column];
    });

    const cursorObj = { values, order };
    return Buffer.from(JSON.stringify(cursorObj)).toString('base64'); // 커서를 base64로 인코딩하여 반환
  }
}
