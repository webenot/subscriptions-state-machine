import { Injectable } from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { randomUUID } from 'crypto';

import { LoggerService } from '~/logger/logger.service';
import { ConfigurationService } from '~/modules/configurations/configuration.service';

import type { ISignatureInfoRequest } from '../../../../common/pdf-signature-info-manager/types/signature-info-request.interface';
import type { ISharedDocumentCertificateData } from '../../../../common/shared-documents/types/shared-document-certificate-data.interface';

@Injectable()
export class SqsProducerService {
  private readonly logger: LoggerService;

  constructor(private readonly sqsService: SqsService, private readonly configurationService: ConfigurationService) {
    this.logger = new LoggerService(SqsProducerService.name);
  }

  async sendSignatureInfoRequest(message: ISignatureInfoRequest): Promise<void> {
    this.logger.log(this.sendSignatureInfoRequest.name, 'Sending signature info request', { message });
    const queueName = this.configurationService.get('AWS_PDF_SIGNATURE_INFO_REQUESTS_QUEUE_NAME');

    await this.sqsService.send(queueName, {
      id: randomUUID(),
      body: message,
    });
  }

  async sendCertificateGenerationRequest(message: ISharedDocumentCertificateData): Promise<void> {
    this.logger.log(this.sendCertificateGenerationRequest.name, 'Sending certificate request', { message });
    const queueName = this.configurationService.get('AWS_CERTIFICATE_GENERATION_REQUESTS_QUEUE_NAME');

    await this.sqsService.send(queueName, {
      id: randomUUID(),
      body: message,
    });
  }
}
