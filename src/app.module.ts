import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ormConfig } from './database/config/ormconfig';
import { CarModule } from './components/car/car.module';
import { ManufacturerModule } from './components/manufacturer/manufacturer.module';
import { OwnerModule } from './components/owner/owner.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(ormConfig()),
    CarModule,
    ManufacturerModule,
    OwnerModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
