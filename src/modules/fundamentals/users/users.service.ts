import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { BaseService } from '~/modules/fundamentals/base/base.service';

import { UserEntity } from './user.entity';

@Injectable()
export class UsersService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    public override repository: Repository<UserEntity>
  ) {
    super(UserEntity, repository);
  }
}
