import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, FindAndModifyWriteOpResultObject } from 'typeorm';
import { ObjectId } from 'mongodb';

import { Manufacturer } from './entity/manufacturer.entity';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: MongoRepository<Manufacturer>
  ) {}

  public findAll(): Promise<Manufacturer[]> {
    return this.manufacturerRepository.find();
  }

  public async findById(_id: ObjectId): Promise<Manufacturer> {
    const manufacturer: Manufacturer = await this.manufacturerRepository.findOne({ _id });
    return manufacturer;
  }

  public async checkExistance(_id: ObjectId): Promise<void> {
    if (_id) {
      const isStored = await this.findById(_id);
      if (!isStored) {
        throw new HttpException(`Manufacturer with id ${_id} not found`, HttpStatus.NOT_FOUND);
      }
    }
  }

  public async create(createManufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
    const manufacturer: Manufacturer = new Manufacturer();
    manufacturer.name = createManufacturerDto.name;
    manufacturer.phone = createManufacturerDto.phone;
    manufacturer.siret = createManufacturerDto.siret;
    return this.manufacturerRepository.save(manufacturer);
  }

  public async update(_id: ObjectId, updateManufacturerDto: UpdateManufacturerDto): Promise<Manufacturer> {
    const queryResult: FindAndModifyWriteOpResultObject = await this.manufacturerRepository.findOneAndUpdate(
      { _id },
      { $set: updateManufacturerDto },
      { returnOriginal: false }
    );

    return queryResult.value;
  }

  public async delete(_id: ObjectId): Promise<Manufacturer> {
    const result: FindAndModifyWriteOpResultObject = await this.manufacturerRepository.findOneAndDelete({ _id });
    return result.value;
  }
}
