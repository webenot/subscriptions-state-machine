import { BaseLoggerService } from '@common/logger/base-logger.service';
import { SqsService } from '@common/sqs/sqs-service';
import { StripeService } from '@common/stripe';
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const logger = new BaseLoggerService('handleWebhook');
const stripeService = new StripeService({
  secretKey: process.env['STRIPE_SECRET_KEY']!,
  webhookSecret: process.env['STRIPE_WEBHOOK_SECRET']!,
});
const sqsService = new SqsService(process.env['SQS_DESTINATION_QUEUE_URL']!);

const STRIPE_SIGNATURE_HEADER = 'Stripe-Signature';

export const handleWebhook = async (
  request: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    if (!request.body) {
      throw new Error('No body in request');
    }

    const signature =
      request.headers[STRIPE_SIGNATURE_HEADER] || request.headers[STRIPE_SIGNATURE_HEADER.toLowerCase()];
    if (typeof signature !== 'string') {
      throw new TypeError('No Stripe signature in request');
    }

    const event = await stripeService.verifyStripeWebhook(signature, request.body);
    logger.info('Handling Stripe event', { event });

    await sqsService.sendMessage(JSON.stringify(event));

    return {
      statusCode: 200,
      body: 'OK',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error.message, error.trace, { event: request.body });

    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
