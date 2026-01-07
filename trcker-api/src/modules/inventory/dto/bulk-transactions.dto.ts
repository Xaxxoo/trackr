import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateTransactionDto } from './create-transaction.dto';

export class BulkTransactionsDto {
  @ApiProperty({
    description: 'Array of transactions to create',
    type: [CreateTransactionDto],
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionDto)
  @ArrayMinSize(1, { message: 'At least one transaction is required' })
  @ArrayMaxSize(100, { message: 'Maximum 100 transactions per batch' })
  transactions: CreateTransactionDto[];
}

export class BulkTransactionResponseDto {
  @ApiProperty({
    description: 'Number of transactions created',
    example: 5,
  })
  created: number;

  @ApiProperty({
    description: 'Number of transactions failed',
    example: 0,
  })
  failed: number;

  @ApiProperty({
    description: 'Array of created transaction IDs',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
  })
  transactionIds: string[];

  @ApiProperty({
    description: 'Array of errors if any',
    example: [],
  })
  errors: Array<{ index: number; error: string }>;
}