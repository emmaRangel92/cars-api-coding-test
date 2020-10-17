import { Body, Controller, Post, Get, Param, Put, Delete } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { ApiOperation } from '@nestjs/swagger';

import { Owner } from './entity/owner.entity';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { ParseObjectIdPipe } from '../../pipes/parseObjectId';


@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {};

  @Get()
  @ApiOperation({ summary: 'Returns array of all saved owners' })
  public async findAll(): Promise<Owner[]> {
    const owners: Owner[] = await this.ownerService.findAll();
    return owners;
  }

  @Get(':_id')
  @ApiOperation({ summary: 'Returns the owner with the given id' })
  public async findById(@Param('_id', ParseObjectIdPipe) _id: ObjectId): Promise<Owner> {
    const owner: Owner = await this.ownerService.findById(_id);
    return owner;
  };

  @Post()
  @ApiOperation({ summary: 'Saves a new owner to the database and returns it' })
  public async create(@Body() ownerDto: CreateOwnerDto): Promise<Owner> {
    const createdOwner: Owner = await this.ownerService.create(ownerDto);
    return createdOwner;
  };

  @Put(':_id')
  @ApiOperation({ summary: 'Updates the properties of the owner with the given id' })
  public update(@Param('_id', ParseObjectIdPipe) _id: ObjectId, @Body() updateOwnerDto: UpdateOwnerDto): Promise<Owner> {
    return this.ownerService.update(_id, updateOwnerDto);
  }

  @Delete(':_id')
  @ApiOperation({ summary: 'Deletes the owner with the given id' })
  public delete(@Param('_id', ParseObjectIdPipe) _id: ObjectId): Promise<Owner> {
    return this.ownerService.delete(_id);
  }
}
