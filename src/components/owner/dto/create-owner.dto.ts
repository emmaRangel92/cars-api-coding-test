import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateIf, IsDate } from 'class-validator';

export class CreateOwnerDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @ValidateIf(({ purchaseDate }) => !!purchaseDate)
  @Type(() => Date)
  @IsDate()
  purchaseDate: Date;
};
