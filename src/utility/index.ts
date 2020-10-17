import { ObjectId } from 'mongodb';
import { Car } from '../components/car/entity/car.entity';

export function getPastDateByMonths(months: number): Date {
  const pastDate: Date = new Date();
  pastDate.setMonth(pastDate.getMonth() - months);
  return pastDate;
};

export function generateCar(
  _id: ObjectId = ObjectId(),
  manufacturerId: ObjectId = ObjectId(),
  price = 0,
  firstRegistrationDate: Date = new Date(),
  owners: ObjectId | ObjectId[] = ObjectId()
): Car {
  const car: Car = new Car;
  car._id = _id;
  car.manufacturerId = manufacturerId;
  car.price = price;
  car.firstRegistrationDate = firstRegistrationDate;
  car.owners = Array.isArray(owners) && owners || [owners];
  return car;
};