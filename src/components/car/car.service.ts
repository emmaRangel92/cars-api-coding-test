import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, UpdateWriteOpResult, AggregationCursor, FindAndModifyWriteOpResultObject } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Manufacturer } from '../manufacturer/entity/manufacturer.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Car } from './entity/car.entity';
import { getPastDateByMonths } from '../../utility';


@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: MongoRepository<Car>
  ) {};

  public findAll(): Promise<Car[]> {
    return this.carRepository.find();
  };

  public findById(_id: ObjectId): Promise<Car> {
    return this.carRepository.findOne({ _id });
  };

  public findByPrice(price: number): Promise<Car[]> {
    return this.carRepository.find({ price });
  };

  /**
   * @description Executes an aggregation that will return the manufacturer of the given car id.
   * @param  {ObjectId} _id: Valid MongoId of existing car
   * @returns The manufacturer associated with the car
   */
  public async getManufacturerByCarId(_id: ObjectId): Promise<Manufacturer> {
    const cursor: AggregationCursor<Manufacturer> = this.carRepository.aggregate(
      [
        { $match: { _id } },
        { $lookup:
          {
            "from": "manufacturer",
            "localField": "manufacturerId",
            "foreignField": "_id",
            "as": "manufacturer"
          }
        },
        { $unwind: "$manufacturer" },
        { $project: { "manufacturer": true, "_id": false } }
      ]
    );

    try {
      const { manufacturer } = await cursor.next();
      return manufacturer;
    } catch(error) {
      throw new HttpException('Manufacturer not found', HttpStatus.NOT_FOUND);
    }
  };

  /**
   * @description Applies a discount to all cars with a firstRegistrationDate within the date range
   * @param  {number} discount - The discount that will be multiplied to the
   * price of the car (use 0.8 if you want to apply a 20% discount)
   * @param  {Date} gteDate - Oldest date in range
   * @param  {Date} ltDate - Newest date in range
   * @returns A promise that resolves to the write results of the operation
   */
  private applyDiscount(discount: number,gteDate: Date, ltDate: Date): Promise<UpdateWriteOpResult> {
    return this.carRepository.updateMany({ firstRegistrationDate: {
      "$gte": gteDate,
      "$lt": ltDate
    }},
    { $mul: { price: discount }})
  };

  /**
   * @description Applies a 20% discount to all cars that have a firstRegistrationDate
   * that is between 18 and 12 months old.
   * @returns A promise that resolves to the write results of the operation
   */
  public discount12to18Months(): Promise<UpdateWriteOpResult> {
    const twelveMonthsAgo: Date = getPastDateByMonths(12);
    const eighteenMonthsAgo: Date = getPastDateByMonths(18);
    const discount = 0.80;
    return this.applyDiscount(discount, eighteenMonthsAgo, twelveMonthsAgo);
  }

  public create(createCarDto: CreateCarDto): Promise<Car> {
    const car: Car = new Car();
    car.manufacturerId = createCarDto.manufacturerId;
    car.price = createCarDto.price;
    car.firstRegistrationDate = createCarDto.firstRegistrationDate || new Date();
    car.owners = createCarDto.owners;
    return this.carRepository.save(car);
  };

  public async update(_id: ObjectId, updateCarDto: UpdateCarDto): Promise<Car> {
    const updatedCar: FindAndModifyWriteOpResultObject =  await this.carRepository.findOneAndUpdate(
      { _id },
      { $set: updateCarDto },
      { returnOriginal: false }
    );

    return updatedCar.value;
  };

  public async addNewOwners(_id: ObjectId, ownersToAdd: ObjectId[]): Promise<Car> {
    const updatedCar = await this.carRepository.findOneAndUpdate(
      { _id },
      { $addToSet: { owners: { $each: ownersToAdd} } },
      { returnOriginal: false }
    );

    return updatedCar.value;
  }

  public async removeOwners(ownersToDelete: ObjectId[]): Promise<void> {
    await this.carRepository.updateMany(
      {},
      { $pull: { "owners": { $in: ownersToDelete } } }
    );
  };

  public async delete(_id: ObjectId): Promise<Car> {
    const result: FindAndModifyWriteOpResultObject = await this.carRepository.findOneAndDelete({ _id });
    return result.value;
  };
}
