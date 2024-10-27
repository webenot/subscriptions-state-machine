import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

import { BaseEntity } from '~/modules/fundamentals/base/base.entity';
import { SubscriptionEntity } from '~/modules/fundamentals/subscriptions/subscription.entity';
import { DatabaseTablesEnum } from '~/providers/database/enums';

@Entity({ name: DatabaseTablesEnum.USERS })
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'boolean', default: false })
  isTrialUsed: boolean;

  @Column({ type: 'boolean', default: false })
  isPremium: boolean;

  @Column({ type: 'boolean', default: false })
  isWebPremium: boolean;

  @Column({ type: 'varchar', nullable: true })
  stripeCustomerId: string | null;

  @OneToMany(() => SubscriptionEntity, (subscription) => subscription.user, { cascade: true })
  subscriptions: SubscriptionEntity[];

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;
}
