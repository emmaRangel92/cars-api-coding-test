import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MongoRepository, ObjectID } from 'typeorm';
import { ObjectId } from 'mongodb';

import { Car } from './entity/car.entity';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { Manufacturer } from '../manufacturer/entity/manufacturer.entity';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { Owner } from '../owner/entity/owner.entity';
import { OwnerService } from '../owner/owner.service';
import {repositoryMockFactory } from '../../mocks/repositoryFactory.mock';
import { MockType } from '../../constant/common';
import { generateCar } from '../../utility/index';

// For timing reasons and simplicity, all database operations were mocked

describe('CarController e2e', () => {
  let carModule: TestingModule;
  let app: INestApplication;
  let carService: CarService;
  let manufacturerService: ManufacturerService;
  let ownerService: OwnerService;
  let carRepoMock: MockType<MongoRepository<Car>>;
  let manufacturerRepoMock: MockType<MongoRepository<Manufacturer>>;
  let ownerRepoMock: MockType<MongoRepository<Owner>>;

  beforeEach(async () => {
    carModule = await Test.createTestingModule({
      providers: [
        CarService, { provide: getRepositoryToken(Car), useFactory: repositoryMockFactory},
        ManufacturerService, { provide: getRepositoryToken(Manufacturer), useFactory: repositoryMockFactory},
        OwnerService, { provide: getRepositoryToken(Owner), useFactory: repositoryMockFactory}
      ],
      controllers: [CarController]
    }).compile();
    carService = carModule.get<CarService>(CarService);
    manufacturerService = carModule.get<ManufacturerService>(ManufacturerService);
    ownerService = carModule.get<OwnerService>(OwnerService);
    carRepoMock = carModule.get(getRepositoryToken(Car));
    manufacturerRepoMock = carModule.get(getRepositoryToken(Manufacturer));
    ownerRepoMock = carModule.get(getRepositoryToken(Owner));
    app = carModule.createNestApplication();
    await app.init();
  });

  describe('Get(/car) findAll', () => {
    const car: Car = generateCar();
    it('Should return an array of cars', async () => {
      const repoSpy = jest.spyOn(carRepoMock,'find').mockReturnValue([car]);
      const serviceSpy = jest.spyOn(carService, 'findAll');
      const result = await request(app.getHttpServer()).get('/car');

      expect(result.status).toBe(200);
      expect(repoSpy).toBeCalledTimes(1);
      expect(serviceSpy).toBeCalledTimes(1);
      expect(result.body).toBeInstanceOf(Array);
      expect(result.text).toEqual(JSON.stringify([car]));
    });
  });

  describe('Get(/car/:id) findById', () => {
    const _id: ObjectId = ObjectId();
    const car: Car = generateCar(_id);
    it('should return a car', async () => {
      const repoSpy = jest.spyOn(carRepoMock,'findOne').mockReturnValue(car);
      const serviceSpy = jest.spyOn(carService, 'findById');

      const result = await request(app.getHttpServer()).get(`/car/${_id}`);
      expect(result.status).toBe(200);
      expect(repoSpy).toBeCalledTimes(1);
      expect(serviceSpy).toBeCalledTimes(1);
      expect(result.text).toEqual(JSON.stringify(car));
    });

    it('should return an error if given id is not a valid MongoId', async () => {
      const invalidId = 'invalidMongoId';
      const repoSpy = jest.spyOn(carRepoMock,'findOne').mockReturnValue(car);
      const serviceSpy = jest.spyOn(carService, 'findById');

      const result = await request(app.getHttpServer()).get(`/car/${invalidId}`);
      expect(result.status).toBe(400);
      expect(repoSpy).toBeCalledTimes(0);
      expect(serviceSpy).toBeCalledTimes(0);
      expect(result.body.message).toBe('Id is not valid ObjectID');
    })
  });

  describe('Get(/car/find-by-price/:price) findByPrice', () => {
    const price = 5000;
    const car: Car = generateCar(undefined, undefined, price);
    it('should return array of cars with given price', async() => {
      const repoSpy = jest.spyOn(carRepoMock, 'find').mockReturnValue(car);
      const serviceSpy = jest.spyOn(carService, 'findByPrice');

      const result = await request(app.getHttpServer()).get(`/car/find-by-price/${price}`);
      expect(result.status).toBe(200);
      expect(repoSpy).toBeCalledTimes(1);
      expect(serviceSpy).toBeCalledTimes(1);
      expect(result.body.price).toEqual(price);
      expect(result.text).toEqual(JSON.stringify(car));
    });
  });

  describe('Get(/car/:id/manufacturer) aggregate', () => {
    const carId = ObjectId();
    const manufacturer: Manufacturer = new Manufacturer();
    manufacturer._id = ObjectId();
    manufacturer.name = 'Toyota';
    manufacturer.phone = '123456';
    manufacturer.siret = 123;

    it('should return a manufacturer', async () => {
      const repoSpy = jest.spyOn(carRepoMock, 'aggregate').mockReturnValue({next: () => Promise.resolve({manufacturer})});
      const serviceSpy = jest.spyOn(carService, 'getManufacturerByCarId');

      const result = await request(app.getHttpServer()).get(`/car/${carId}/manufacturer`);
      expect(result.status).toBe(200);
      expect(repoSpy).toBeCalledTimes(1);
      expect(serviceSpy).toBeCalledTimes(1);
      expect(result.text).toEqual(JSON.stringify(manufacturer));
    });
  });

  describe('Post(/car) create', () => {
    const _id: ObjectId = ObjectId();
    const manufacturerId: ObjectId = ObjectId();
    const price = 2000;
    const firstRegistrationDate: Date = new Date();
    const ownerId: ObjectId = ObjectId();
    const owners: ObjectId[] = [ownerId]
    const car = generateCar(_id, manufacturerId, price, firstRegistrationDate, owners);

    it('should return a new manufacturer', async () => {
      const carRepoSpy = jest.spyOn(carRepoMock, 'save').mockReturnValue(car);
      const manufactureRepoSpy = jest.spyOn(manufacturerRepoMock, 'findOne').mockReturnValue(true);
      const ownerRepoSpy = jest.spyOn(ownerRepoMock, 'findByIds').mockReturnValue([true]);
      const carServiceSpy = jest.spyOn(carService, 'create');
      const manufacturerServiceSpy = jest.spyOn(manufacturerService, 'checkExistance');
      const ownerServiceSpy = jest.spyOn(ownerService, 'checkExistance');

      const result = await request(app.getHttpServer())
        .post('/car')
        .send({_id, manufacturerId, price, firstRegistrationDate, owners});

      expect(result.status).toBe(201);
      expect(carRepoSpy).toBeCalledTimes(1);
      expect(manufactureRepoSpy).toBeCalledTimes(1);
      expect(ownerRepoSpy).toBeCalledTimes(1);
      expect(carServiceSpy).toBeCalledTimes(1);
      expect(manufacturerServiceSpy).toBeCalledTimes(1);
      expect(ownerServiceSpy).toBeCalledTimes(1);
      expect(result.text).toEqual(JSON.stringify(car));
    });

    it('should return an error if given manufacturerId does not exist', async () => {
      const inexistentManufacturerId: ObjectId = ObjectId();
      const carRepoSpy = jest.spyOn(carRepoMock, 'save');
      const manufactureRepoSpy = jest.spyOn(manufacturerRepoMock, 'findOne').mockReturnValue(false);
      const ownerRepoSpy = jest.spyOn(ownerRepoMock, 'findByIds');
      const carServiceSpy = jest.spyOn(carService, 'create');
      const manufacturerServiceSpy = jest.spyOn(manufacturerService, 'checkExistance');
      const ownerServiceSpy = jest.spyOn(ownerService, 'checkExistance');

      const result = await request(app.getHttpServer())
        .post('/car')
        .send({_id, manufacturerId: inexistentManufacturerId, price, firstRegistrationDate, owners});

      expect(result.status).toBe(404);
      expect(carRepoSpy).toBeCalledTimes(0);
      expect(manufactureRepoSpy).toBeCalledTimes(1);
      expect(ownerRepoSpy).toBeCalledTimes(0);
      expect(carServiceSpy).toBeCalledTimes(0);
      expect(manufacturerServiceSpy).toBeCalledTimes(1);
      expect(ownerServiceSpy).toBeCalledTimes(0);
    });
  });

  describe('Put(/car/:id) update', () => {
    const _id: ObjectId = ObjectId();
    const manufacturerId: ObjectId = ObjectId();
    const price = 2000;
    const firstRegistrationDate: Date = new Date();
    const ownerId: ObjectId = ObjectId();
    const owners: ObjectId[] = [ownerId]
    const car = generateCar(_id, manufacturerId, price, firstRegistrationDate, owners);
    it('should return an updated car', async () => {
      const carRepoSpy = jest.spyOn(carRepoMock, 'findOneAndUpdate').mockReturnValue({ value: car })
      const manufactureRepoSpy = jest.spyOn(manufacturerRepoMock, 'findOne')
      const ownerRepoSpy = jest.spyOn(ownerRepoMock, 'findByIds')
      const carServiceSpy = jest.spyOn(carService, 'update');
      const manufacturerServiceSpy = jest.spyOn(manufacturerService, 'checkExistance');
      const ownerServiceSpy = jest.spyOn(ownerService, 'checkExistance');

      const result = await request(app.getHttpServer())
        .put(`/car/${_id}`)
        .send({ price });
      
      expect(result.status).toBe(200);
      expect(carRepoSpy).toBeCalledTimes(1);
      expect(manufactureRepoSpy).toBeCalledTimes(0);
      expect(ownerRepoSpy).toBeCalledTimes(0);
      expect(carServiceSpy).toBeCalledTimes(1);
      expect(manufacturerServiceSpy).toBeCalledTimes(1);
      expect(ownerServiceSpy).toBeCalledTimes(1);
      expect(result.text).toEqual(JSON.stringify(car));
    });

    it('should return an error if any owner id does not exist', async () => {
      const carRepoSpy = jest.spyOn(carRepoMock, 'findOneAndUpdate');
      const manufactureRepoSpy = jest.spyOn(manufacturerRepoMock, 'findOne')
      const ownerRepoSpy = jest.spyOn(ownerRepoMock, 'findByIds').mockReturnValue([]);
      const carServiceSpy = jest.spyOn(carService, 'update');
      const manufacturerServiceSpy = jest.spyOn(manufacturerService, 'checkExistance');
      const ownerServiceSpy = jest.spyOn(ownerService, 'checkExistance');

      const result = await request(app.getHttpServer())
      .put(`/car/${_id}`)
      .send({ owners });

      expect(result.status).toBe(404);
      expect(carRepoSpy).toBeCalledTimes(0);
      expect(manufactureRepoSpy).toBeCalledTimes(0);
      expect(ownerRepoSpy).toBeCalledTimes(1);
      expect(carServiceSpy).toBeCalledTimes(0);
      expect(manufacturerServiceSpy).toBeCalledTimes(1);
      expect(ownerServiceSpy).toBeCalledTimes(1);
    });
  });

  describe('Delete(/car/:id) delete', () => {
    const _id: ObjectId = ObjectId();
    const manufacturerId: ObjectId = ObjectId();
    const price = 2000;
    const firstRegistrationDate: Date = new Date();
    const car: Car = generateCar(_id, manufacturerId, price, firstRegistrationDate);
    it('should return the deleted car', async () => {
      const repoSpy = jest.spyOn(carRepoMock, 'findOneAndDelete').mockReturnValue({ value: car });
      const serviceSpy = jest.spyOn(carService, 'delete');

      const result = await request(app.getHttpServer()).delete(`/car/${_id}`);

      expect(result.status).toBe(200);
      expect(repoSpy).toBeCalledTimes(1);
      expect(serviceSpy).toBeCalledTimes(1);
      expect(result.text).toEqual(JSON.stringify(car));
    });
  });

  describe('Patch(car/run-discount-process) runDiscountProcess', () => {
    const oldOwnerId: ObjectId = ObjectId();
    
    it('should remove owners and apply car discounts where applicable', async () => {
      const ownerServiceGetOlderThan18MonthsSpy = jest.spyOn(ownerService, 'getOlderThan18Months');
      const ownerRepoAggregateSpy = jest.spyOn(ownerRepoMock, 'aggregate').mockReturnValue({ toArray: () => [ {_id: oldOwnerId } ]});
      const carServiceRemoveOwnersSpy = jest.spyOn(carService, 'removeOwners');
      const carRepoUpdateManySpy = jest.spyOn(carRepoMock, 'updateMany');
      const ownerServiceDeleteByIdsSpy = jest.spyOn(ownerService, 'deleteByIds');
      const ownerRepoDeleteManySpy = jest.spyOn(ownerRepoMock, 'deleteMany');
      const carServicediscount12to18MonthsSpy = jest.spyOn(carService, 'discount12to18Months');

      const result = await request(app.getHttpServer()).patch('/car/run-discount-process');
      
      expect(result.status).toBe(200);
      expect(ownerServiceGetOlderThan18MonthsSpy).toBeCalledTimes(1);
      expect(ownerRepoAggregateSpy).toBeCalledTimes(1);
      expect(carServiceRemoveOwnersSpy).toBeCalledTimes(1);
      expect(carRepoUpdateManySpy).toBeCalledTimes(2);
      expect(ownerServiceDeleteByIdsSpy).toBeCalledTimes(1);
      expect(ownerRepoDeleteManySpy).toBeCalledTimes(1);
      expect(carServicediscount12to18MonthsSpy).toBeCalledTimes(1);
      expect(result.text).toEqual('Process executed successfully');
    })
  });
})