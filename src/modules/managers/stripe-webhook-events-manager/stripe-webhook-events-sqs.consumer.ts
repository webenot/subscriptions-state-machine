import type { Message } from '@aws-sdk/client-sqs';
import { Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';
import { BaseSqsEventsConsumer } from '~/providers/aws/sqs/base-sqs-events.consumer';

import { StripeWebhookEventsManagerService } from './stripe-webhook-events-manager.service';

const configurationService = new ConfigurationService();

const queueName = configurationService.get('AWS_STRIPE_WEBHOOK_EVENTS_QUEUE_NAME');

@Injectable()
export class StripeWebhookEventsSqsConsumer extends BaseSqsEventsConsumer {
  constructor(private readonly stripeWebhookEventsManagerService: StripeWebhookEventsManagerService) {
    super(new LoggerService(StripeWebhookEventsSqsConsumer.name));
  }

  @SqsMessageHandler(queueName, false)
  async handleStripeWebhookEvent(message: Message): Promise<void> {
    await this.handleEvent(message, this.stripeWebhookEventsManagerService);
  }
}
