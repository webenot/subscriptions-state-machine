import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  EntityTarget,
  FindOptionsWhere,
  In,
  ObjectLiteral,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export class BaseService<T extends ObjectLiteral> {
  protected entity: EntityTarget<T>;
  protected repository: Repository<T>;

  constructor(entity: EntityTarget<T>, repository: Repository<T>) {
    this.entity = entity;
    this.repository = repository;
  }

  public async create(data: DeepPartial<T>, entityManager?: EntityManager): Promise<T> {
    const repository = this.getRepository(entityManager);
    return repository.save(data);
  }

  public async findOne(filters: Partial<T>, entityManager?: EntityManager): Promise<T | null> {
    const repository = this.getRepository(entityManager);
    return repository.findOne(filters);
  }

  public async find(filters: FindOptionsWhere<T>, entityManager?: EntityManager): Promise<T[]> {
    const repository = this.getRepository(entityManager);
    return repository.find({ where: filters });
  }

  public async findManyByIds(ids: Array<string>, entityManager?: EntityManager): Promise<T[]> {
    const repository = this.getRepository(entityManager);
    return repository.find({
      // Known typeorm issue https://github.com/typeorm/typeorm/issues/8939
      // typeorm@0.3.12 still did not fixed
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      where: {
        id: In(ids),
      },
    });
  }

  public async update(
    id: string | string[] | FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
    entityManager?: EntityManager
  ): Promise<UpdateResult> {
    const repository = this.getRepository(entityManager);
    return repository.update(id, data);
  }

  public async remove(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const repository = this.getRepository(entityManager);
    return repository.delete(id);
  }

  protected getRepository(entityManager?: EntityManager): Repository<T> {
    return entityManager ? entityManager.getRepository(this.entity) : this.repository;
  }
}
