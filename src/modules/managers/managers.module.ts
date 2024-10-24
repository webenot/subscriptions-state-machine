import { type DynamicModule, Module } from '@nestjs/common';

const modules: DynamicModule[] = [];
@Module({
  imports: modules,
  exports: modules,
})
export class ManagersModule {}
