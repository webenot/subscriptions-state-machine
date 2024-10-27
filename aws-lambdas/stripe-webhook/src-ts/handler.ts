import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { BaseLoggerService } from '../../../common/logger/base-logger.service';
import { SqsService } from '../../../common/sqs/sqs-service';
import { StripeService } from '../../../common/stripe';

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
  const signature = request.headers[STRIPE_SIGNATURE_HEADER] || request.headers[STRIPE_SIGNATURE_HEADER.toLowerCase()];

  try {
    if (!request.body) {
      throw new Error('No body in request');
    }
    if (typeof signature !== 'string') {
      throw new TypeError('No Stripe signature in request');
    }

    const event = await stripeService.verifyStripeWebhook(signature, Buffer.from(request.body, 'utf8'));
    logger.info('Handling Stripe event', { event });

    await sqsService.sendMessage(JSON.stringify(event));

    return {
      statusCode: 200,
      body: 'OK',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error(error.message, error.trace, { event: request.body, signature, headers: request.headers });

    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
