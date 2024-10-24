import { repl } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  await repl(AppModule);
}
// eslint-disable-next-line no-console
bootstrap().catch(console.error);
