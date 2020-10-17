import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity({name: 'owner'})
export class Owner {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string'})
  name: string;

  @Column({ type: 'date'})
  purchaseDate: Date;
}
