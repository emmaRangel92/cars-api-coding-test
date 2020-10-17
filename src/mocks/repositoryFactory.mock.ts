import { Entity, MongoRepository } from 'typeorm';
import { MockType } from '../constant/common';

// @ts-ignore
export const repositoryMockFactory: () => MockType<MongoRepository<unknown>> = jest.fn(()=>({
  find: jest.fn(entity => [entity]),
  findOne: jest.fn(entity => entity),
  findByIds: jest.fn(entity => [entity]),
  findOneAndUpdate: jest.fn(entity => ({value: entity})),
  aggregate: jest.fn(entity => entity),
  save: jest.fn(entity => entity),
  findOneAndDelete: jest.fn(entity => entity),
  updateMany: jest.fn(entity => entity),
  deleteMany: jest.fn(entity => entity),
}));