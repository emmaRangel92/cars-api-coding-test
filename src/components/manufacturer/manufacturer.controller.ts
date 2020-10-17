import { Body, Controller, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ApiOperation } from '@nestjs/swagger';

import { Manufacturer } from './entity/manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { ParseObjectIdPipe } from '../../pipes/parseObjectId';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';

@Controller('manufacturer')
export class ManufacturerController {
  constructor(private readonly manufacturerService: ManufacturerService){};

  @Get()
  @ApiOperation({ summary: 'Returns array of all saved manufacturers' })
  public async findAll(): Promise<Manufacturer[]> {
    const manufacturers: Manufacturer[] = await this.manufacturerService.findAll();
    return manufacturers;
  }

  @Post()
  @ApiOperation({ summary: 'Saves a new manufacturer to the database and returns it' })
  public async create(@Body() manufacturerDto: CreateManufacturerDto): Promise<Manufacturer> {
    const createdManufacturer: Manufacturer = await this.manufacturerService.create(manufacturerDto);
    return createdManufacturer;
  }

  @Put(':_id')
  @ApiOperation({ summary: 'Updates the properties of the manufacturer with the given id' })
  public async update(@Param('_id', ParseObjectIdPipe) _id: ObjectId, @Body() updateManufacturerDto: UpdateManufacturerDto): Promise<Manufacturer> {
    const updatedManufacturer: Manufacturer = await this.manufacturerService.update(_id, updateManufacturerDto);
    return updatedManufacturer
  }

  @Delete(':_id')
  @ApiOperation({ summary: 'Deletes the manufacturer with the given id' })
  public delete(@Param('_id',ParseObjectIdPipe) _id: ObjectId): Promise<Manufacturer> {
    return this.manufacturerService.delete(_id);
  }
}
