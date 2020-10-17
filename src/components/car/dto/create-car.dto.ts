import {
  ValidateIf,
  Min,
  IsNumber,
  IsDate,
  Allow,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { ObjectId } from 'mongodb';
import { Double } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateCarDto {
  @ApiProperty({ type: ObjectId })
  @Allow()
  @Transform((id: string) => {
    try {
      return ObjectId.createFromHexString(id);
    } catch (error) {
      throw new HttpException('manufacturerId is not valid MongoDB ObjectId', HttpStatus.BAD_REQUEST);
    }
  })
  manufacturerId: ObjectId;

  @ApiProperty({ type: Number})
  @IsNumber()
  @Type(() => Double)
  @Min(0)
  price: number;

  @ApiProperty({type: Date})
  @ValidateIf(({ purchaseDate }) => !!purchaseDate)
  @Type(() => Date)
  @IsDate()
  firstRegistrationDate: Date;

  @ApiProperty({type: [ObjectId]})
  @Allow({ each: true })
  @Transform((ids: string[]) => {
    try {
      return ids.map((id: ObjectId) => ObjectId.createFromHexString(id));
    } catch (error) {
      throw new HttpException('All elements in owners array must be valid MongoDB ObjectIds', HttpStatus.BAD_REQUEST);
    }
  })
  owners: ObjectId[]
}
