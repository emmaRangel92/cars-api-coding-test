import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { CarService } from './car.service';
import { Car } from './entity/car.entity';
import { generateCar } from '../../utility/index';

describe('Car Service', ()=> {
  const mockRepo = new (MongoRepository as jest.Mock<MongoRepository<Car>>)();
  const sut = new CarService(mockRepo);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('findAll', ()=> {
    it('should find all the cars', async () => {
      const findSpy = jest.spyOn(mockRepo, 'find').mockResolvedValue([]);
      const result = await sut.findAll();
      expect(result).toEqual([]);
      expect(findSpy).toBeCalledTimes(1);
    })

    it('should throw and error if database fails', async () => {
      const findSpy = jest.spyOn(mockRepo, 'find').mockRejectedValue(new Error('error'));
      const result = sut.findAll();
      await expect(result).rejects.toThrow('error');
      expect(findSpy).toBeCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should find car with the given _id', async () => {
      const _id: ObjectId = ObjectId();
      const car: Car = generateCar(_id);

      const findOneSpy = jest.spyOn(mockRepo, 'findOne').mockResolvedValue(car);
      const result = await sut.findById(_id);

      expect(result).toEqual(car);
      expect(findOneSpy).toBeCalledTimes(1);
    });
  });
});