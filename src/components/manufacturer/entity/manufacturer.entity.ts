import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity({name: 'manufacturer'})
export class Manufacturer {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  name: string;

  @Column({ type: 'string' })
  phone: string;

  @Column({ type: 'number' })
  siret: number;
}