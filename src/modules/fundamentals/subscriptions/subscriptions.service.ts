import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager, Repository } from 'typeorm';

import { BaseService } from '~/modules/fundamentals/base/base.service';
import { DatabaseTablesEnum } from '~/providers/database/enums';

import { EMPTY_STRING } from '../../../../common/utils/constants';
import { SubscriptionPlatformEnum, SubscriptionStatusEnum } from './enums';
import { SubscriptionEntity } from './subscription.entity';

@Injectable()
export class SubscriptionsService extends BaseService<SubscriptionEntity> {
  constructor(
    @InjectRepository(SubscriptionEntity)
    public override repository: Repository<SubscriptionEntity>
  ) {
    super(SubscriptionEntity, repository);
  }

  async getUserCurrentSubscription(
    userId: string,
    entityManager?: EntityManager,
    additionalWhereConditions = EMPTY_STRING
  ): Promise<SubscriptionEntity | null> {
    const query = `
      SELECT
        DISTINCT ON(s."userId") s.*
      FROM ${DatabaseTablesEnum.SUBSCRIPTIONS} s
      WHERE s."userId" = $1 ${additionalWhereConditions}
      ORDER BY s."userId",
        CASE
          WHEN s."provider" = $2 AND s."status" = $4
          THEN 1
          WHEN s."provider" = $3 AND s."status" != $5
          THEN 2
          WHEN s."provider" != $3 AND s."status" != $5
          THEN 3
          ELSE 4
        END,
        s."createdAt" DESC`;
    const [subscription] = await this.getRepository(entityManager).query(query, [
      userId,
      SubscriptionPlatformEnum.MANUAL,
      SubscriptionPlatformEnum.STRIPE,
      SubscriptionStatusEnum.ACTIVE,
      SubscriptionStatusEnum.EXPIRED,
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return subscription || null;
  }
}
