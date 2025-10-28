import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountDto {
  @ApiProperty({
    description: 'The institution code for the bank',
    example: 'OPAYNGPC',
  })
  @IsString()
  institution: string;

  @ApiProperty({
    description: 'The account identifier (account number)',
    example: '1234567890',
  })
  @IsString()
  accountIdentifier: string;
}