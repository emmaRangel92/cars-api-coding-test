import { Column, Entity, ObjectIdColumn, Double } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity({name: 'car'})
export class Car {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  manufacturerId: ObjectId;

  @Column({ type: 'double' })
  price: Double;

  @Column({ type: 'date' })
  firstRegistrationDate: Date;

  @Column()
  owners: ObjectId[]
}
