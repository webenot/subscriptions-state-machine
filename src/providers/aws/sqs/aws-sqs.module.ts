import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';

import { ConfigurationModule } from '~/modules/configurations/configuration.module';
import { ConfigurationService } from '~/modules/configurations/configuration.service';

import { SqsProducerService } from './sqs-producer.service';

@Module({
  imports: [
    ConfigurationModule,
    SqsModule.registerAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      useFactory: (configurationService: ConfigurationService) => {
        const AWS_REGION = configurationService.get('AWS_REGION') as string;

        return {
          consumers: [
            {
              name: configurationService.get('AWS_STRIPE_WEBHOOK_EVENTS_QUEUE_NAME'),
              queueUrl: configurationService.get('AWS_STRIPE_WEBHOOK_EVENTS_QUEUE_URL'),
              region: AWS_REGION,
            },
          ],
          producers: [],
        };
      },
    }),
  ],
  providers: [SqsProducerService],
  exports: [SqsProducerService],
})
export class AwsSqsModule {}
