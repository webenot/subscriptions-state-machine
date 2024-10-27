import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '~/modules/fundamentals/base/base.entity';
import { UserEntity } from '~/modules/fundamentals/users/user.entity';
import { DatabaseTablesEnum } from '~/providers/database/enums';

import { SubscriptionPlatformEnum, SubscriptionStatusEnum } from './enums';

@Entity({ name: DatabaseTablesEnum.SUBSCRIPTIONS })
export class SubscriptionEntity extends BaseEntity {
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: SubscriptionPlatformEnum, enumName: 'subscriptionPlatformEnum' })
  provider: SubscriptionPlatformEnum;

  @Column({ type: 'enum', enum: SubscriptionStatusEnum, enumName: 'subscriptionStatusEnum' })
  status: SubscriptionStatusEnum;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startsAt: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  expiresAt: string | null;

  @Column({ type: 'boolean', default: false })
  onTrial: boolean;

  @Column({ type: 'boolean', default: false })
  isAutoRenewed: boolean;

  @Column({ type: 'varchar', nullable: true })
  stripeSubscriptionId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  stripeSubscription: object | null;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
