import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTables1729753491292 implements MigrationInterface {
  name = 'AddTables1729753491292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "users"
       (
           "id"               uuid                     NOT NULL DEFAULT uuid_generate_v4(),
           "createdAt"        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
           "updatedAt"        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
           "email"            character varying        NOT NULL,
           "password"         character varying        NOT NULL,
           "isTrialUsed"      boolean                  NOT NULL DEFAULT false,
           "isPremium"        boolean                  NOT NULL DEFAULT false,
           "isWebPremium"     boolean                  NOT NULL DEFAULT false,
           "stripeCustomerId" character varying,
           "firstName"        character varying,
           "lastName"         character varying,
           CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
           CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
       )`);
    await queryRunner.query(`CREATE TYPE "public"."subscriptionPlatformEnum" AS
      ENUM('GOOGLE', 'APPLE', 'MANUAL', 'STRIPE')`);
    await queryRunner.query(`CREATE TYPE "public"."subscriptionStatusEnum" AS
      ENUM('ACTIVE', 'CANCELED', 'EXPIRED', 'ON_HOLD', 'PAUSED', 'IN_GRACE', 'PENDING', 'PAYMENT_FAILED')`);
    await queryRunner.query(`CREATE TABLE "subscriptions"
       (
           "id"                   uuid                                NOT NULL DEFAULT uuid_generate_v4(),
           "createdAt"            TIMESTAMP WITH TIME ZONE            NOT NULL DEFAULT now(),
           "updatedAt"            TIMESTAMP WITH TIME ZONE            NOT NULL DEFAULT now(),
           "userId"               uuid                                NOT NULL,
           "provider"             "public"."subscriptionPlatformEnum" NOT NULL,
           "status"               "public"."subscriptionStatusEnum"   NOT NULL,
           "startsAt"             TIMESTAMP WITH TIME ZONE,
           "expiresAt"            TIMESTAMP WITH TIME ZONE,
           "onTrial"              boolean                             NOT NULL DEFAULT false,
           "isAutoRenewed"        boolean                             NOT NULL DEFAULT false,
           "stripeSubscriptionId" character varying,
           "stripeSubscription"   jsonb,
           CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id")
       )`);
    await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"
      FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
    await queryRunner.query(`DROP TABLE "subscriptions"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptionStatusEnum"`);
    await queryRunner.query(`DROP TYPE "public"."subscriptionPlatformEnum"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
