import {
  SendMessageCommand,
  SendMessageCommandInput,
  SendMessageCommandOutput,
  SQSClient,
  SQSClientConfig,
} from '@aws-sdk/client-sqs';

export class SqsService {
  private readonly QUEUE_URL: string;
  private readonly sqs: SQSClient;

  constructor(queueUrl: string, config?: SQSClientConfig) {
    this.QUEUE_URL = queueUrl;
    this.sqs = config ? new SQSClient(config) : new SQSClient();
  }

  async sendMessage(message: string): Promise<SendMessageCommandOutput> {
    const commandInput: SendMessageCommandInput = {
      QueueUrl: this.QUEUE_URL,
      MessageBody: message,
    };
    const command = new SendMessageCommand(commandInput);
    return await this.sqs.send(command);
  }
}
