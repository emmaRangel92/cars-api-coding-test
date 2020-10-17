import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './entity/car.entity';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { Manufacturer} from '../manufacturer/entity/manufacturer.entity';
import { ManufacturerService } from '../manufacturer/manufacturer.service';
import { Owner } from '../owner/entity/owner.entity';
import { OwnerService } from '../owner/owner.service';

@Module({
  imports: [TypeOrmModule.forFeature([Car, Manufacturer, Owner])],
  providers: [CarService, ManufacturerService, OwnerService],
  controllers: [CarController]
})
export class CarModule {
  
};
