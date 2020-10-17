import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AggregationCursor, FindAndModifyWriteOpResultObject, MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { Owner } from './entity/owner.entity';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { getPastDateByMonths } from '../../utility';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(Owner)
    private readonly ownerRepository: MongoRepository<Owner>
  ) {};

  public findAll(): Promise<Owner[]> {
    return this.ownerRepository.find();
  };

  public findById(_id: ObjectId): Promise<Owner> {
    return this.ownerRepository.findOne({ _id });
  };

  public async checkExistance(_ids: ObjectId[]): Promise<void> {
    if (_ids && _ids.length > 0) {
      const isStored = await this.ownerRepository.findByIds(_ids, { cache: true });
      if (_ids.length > isStored.length) {
        throw new HttpException('Some owners not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  public create(createOwnerDto: CreateOwnerDto): Promise<Owner> {
    const  owner: Owner = new Owner();
    owner.name = createOwnerDto.name;
    owner.purchaseDate = createOwnerDto.purchaseDate || new Date();
    return this.ownerRepository.save(owner);
  };

  public async update(_id: ObjectId, updateOwnerDto: UpdateOwnerDto): Promise<Owner> {
    const updatedOwner: FindAndModifyWriteOpResultObject = await this.ownerRepository.findOneAndUpdate(
      { _id },
      { $set: updateOwnerDto },
      { returnOriginal: false }
    );

    return updatedOwner.value;
  };

  public async delete(_id: ObjectId): Promise<Owner> {
    const result: FindAndModifyWriteOpResultObject = await this.ownerRepository.findOneAndDelete({ _id });
    return result.value;
  };

  public async deleteByIds(_ids: ObjectId[]): Promise<void> {
    await this.ownerRepository.deleteMany({_id: { $in: _ids }});
  }

  public async getOlderThan18Months(): Promise<ObjectId[]> {
    const eighteenMonthsAgo: Date = getPastDateByMonths(18);
    const result: AggregationCursor<Owner> = await this.ownerRepository.aggregate([
      { $match: { purchaseDate: { $lte: eighteenMonthsAgo } } },
      { $project: { "_id": true } }
    ]);

    const ids: ObjectId[] = await result.toArray()

    return ids.map(doc => doc._id);
  };
}
