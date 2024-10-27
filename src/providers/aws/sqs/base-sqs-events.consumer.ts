import type { Message } from '@aws-sdk/client-sqs';

import type { LoggerService } from '~/logger/logger.service';

import { setAsyncLocalStorageContextForSQSMessages } from '../../../../common/local-storage';
import type { BaseSqsEventsHandlerService } from './base-sqs-events-handler.service';

export abstract class BaseSqsEventsConsumer {
  protected readonly logger: LoggerService;

  protected constructor(logger: LoggerService) {
    this.logger = logger;
  }

  async handleEvent<TEventType extends string, TEvent extends { type: TEventType }>(
    message: Message,
    service: BaseSqsEventsHandlerService
  ): Promise<void> {
    setAsyncLocalStorageContextForSQSMessages({ messageId: message.MessageId });

    try {
      this.logger.log('SQS event listener', {
        message,
      });
      const event = JSON.parse(<string>message.Body) as TEvent;

      await service.handleEvent(event);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      this.logger.error('SQS event listener error', error.message, {
        message,
      });
      throw error;
    }
  }
}
