/* eslint-disable import/extensions */
import { Body, Controller, Post, Get, Param, Put, Delete, Patch } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ApiOperation } from '@nestjs/swagger';

import { Car } from './entity/car.entity';
import { CarService } from './car.service';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { OwnerService } from '../owner/owner.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Manufacturer } from '../manufacturer/entity/manufacturer.entity';
import { ParseObjectIdPipe } from '../../pipes/parseObjectId';

@Controller('car')
export class CarController {
  constructor(
    private readonly carService: CarService,
    private readonly manufacturerService: ManufacturerService,
    private readonly ownerService: OwnerService
  ) {};

  @Get()
  @ApiOperation({ summary: 'Returns an array of all saved cars' })
  public async findAll(): Promise<Car[]> {
    const cars: Car[] = await this.carService.findAll();
    return cars;
  };

  @Get(':_id')
  @ApiOperation({ summary: 'Returns the car with the given id' })
  public async findById(@Param('_id', ParseObjectIdPipe) _id: ObjectId): Promise<Car> {
    const car: Car = await this.carService.findById(_id);
    return car;
  };

  @Get('/find-by-price/:price')
  @ApiOperation({ summary: 'Returns all cars that have the given price' })
  public async findByPrice(@Param() price: number): Promise<Car[]> {
    const cars: Car[] = await this.carService.findByPrice(price);
    return cars;
  };

  @Get(':_id/manufacturer')
  @ApiOperation({ summary: 'Returns the manufacturer of the car with the given id' })
  public async getManufacturerByCarId(@Param('_id', ParseObjectIdPipe) _id: ObjectId ): Promise<Manufacturer> {
    const manufacturer: Manufacturer = await this.carService.getManufacturerByCarId(_id);
    return manufacturer;
  };

  @Post()
  @ApiOperation({ summary: 'Saves a new car to the database and returns it' })
  public async create(@Body() createCarDto: CreateCarDto): Promise<Car> {
    await this.manufacturerService.checkExistance(createCarDto.manufacturerId);
    await this.ownerService.checkExistance(createCarDto.owners);
    const createdCar: Car = await this.carService.create(createCarDto);
    return createdCar;
  };

  @Put(':_id')
  @ApiOperation({ summary: 'Updates the properties of the car with the given id' })
  public async update(@Param('_id', ParseObjectIdPipe) _id: ObjectId, @Body() updateCarDto: UpdateCarDto): Promise<Car> {
    await this.manufacturerService.checkExistance(updateCarDto.manufacturerId);
    await this.ownerService.checkExistance(updateCarDto.owners);
    const updatedCar: Car = await this.carService.update(_id, updateCarDto);
    return updatedCar;
  }

  @Put(':_id/owners')
  @ApiOperation({ summary: 'Adds a owner id(s) to the owners array of the car with the given id' })
  public async addNewOwners(@Param('_id', ParseObjectIdPipe) id: ObjectId, @Body() updateCarDto: UpdateCarDto): Promise<Car> {
    await this.ownerService.checkExistance(updateCarDto.owners);
    const updatedCar: Car = await this.carService.addNewOwners(id, updateCarDto.owners);
    return updatedCar;
  }

  @Delete(':_id')
  @ApiOperation({ summary: 'Deletes the car with the given id' })
  public delete(@Param('_id', ParseObjectIdPipe) _id: ObjectId): Promise<Car> {
    return this.carService.delete(_id);
  }

  @Patch('/run-discount-process')
  @ApiOperation({ summary: 'Removes owners with car purchases older than 18 months and applies a 20% discount to cars registered between 18 and 12 months ago' })
  public async runDiscountProcess(): Promise<string> {
    const owners: ObjectId[] = await this.ownerService.getOlderThan18Months();

    await this.carService.removeOwners(owners);
    await Promise.all([
      this.ownerService.deleteByIds(owners),
      this.carService.discount12to18Months()
    ]);
    return 'Process executed successfully';
  }
}
