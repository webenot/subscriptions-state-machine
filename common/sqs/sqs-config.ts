import type { SQSClientConfig } from '@aws-sdk/client-sqs';

export const sqsConfig: SQSClientConfig = {
  credentials: {
    accessKeyId: process.env['ACCESS_KEY_ID'] as string,
    secretAccessKey: process.env['SECRET_ACCESS_KEY'] as string,
  },
};
