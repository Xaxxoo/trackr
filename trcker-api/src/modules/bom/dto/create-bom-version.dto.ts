import {
  IsString,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VersionChangeType } from '../entities/bom-version.entity';

export class CreateBomVersionDto {
  @ApiProperty({
    description: 'Change type',
    enum: VersionChangeType,
    example: VersionChangeType.MAJOR,
  })
  @IsEnum(VersionChangeType)
  @IsNotEmpty()
  changeType: VersionChangeType;

  @ApiProperty({
    description: 'Change description',
    example: 'Updated cotton fiber specification to premium grade',
  })
  @IsString()
  @IsNotEmpty()
  changeDescription: string;
}