import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { name, version } from '../package.json';
import { AppModule } from './app.module';
import { LoggerInterceptor } from './logger/logger.interceptor';
import { ConfigurationService } from './modules/configurations/configuration.service';
import { API_VERSION } from './modules/utils/constants';

const configurationService = new ConfigurationService();

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { cors: true });
  setupBaseConfigurations(app);
  setupSwagger(app);

  return app;
}

async function bootstrap(): Promise<void> {
  const app = await createApp();
  await app.listen(configurationService.get('SERVICE_PORT'));
}

function setupSwagger(app: INestApplication): void {
  const swaggerOptions = new DocumentBuilder()
    .setTitle(`${name} API`)
    .setDescription(`Documentation for ${name} API`)
    .setVersion(version)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);

  SwaggerModule.setup('/documentation', app, document);
}

function setupBaseConfigurations(app: INestApplication): void {
  const validationPipeOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    // after updating class-validator to v0.14.0 pipes throws errors when try to use @Param decorator
    // that is why we need to turn off this option
    // Issue https://github.com/nestjs/nest/issues/10683
    // npm audit error for lower versions https://github.com/advisories/GHSA-fj58-h2fr-3pp2
    forbidUnknownValues: false,
  };
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
  app.setGlobalPrefix(API_VERSION);
  app.useGlobalInterceptors(new LoggerInterceptor());
}

bootstrap();
