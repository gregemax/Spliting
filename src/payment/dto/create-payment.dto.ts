import { IsString, IsNumber, IsObject, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class RecipientDto {
    @ApiProperty({
        description: 'The institution code for the recipient bank',
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

    @ApiProperty({
        description: 'The currency code for the transaction',
        example: 'NGN',
    })
    @IsString()
    currency: string;
    
}

export class CreatePaymentDto {
    @ApiProperty({
        description: 'The amount to be paid',
        example: 1000,
    })
    @IsNumber()
    amount: number;

    @ApiProperty({
        description: 'The token symbol for the payment',
        example: 'USDC',
    })
    @IsString()
    token: string;

    @ApiProperty({
        description: 'Recipient details including bank and account information',
        type: RecipientDto,
    })
    recipient: RecipientDto;

    @ApiProperty({
        description: 'The blockchain network for the transaction',
        example: 'celo',
        enum: ['base', 'bnb-smart-chain', 'lisk', 'tron', 'celo', 'arbitrum-one', 'polygon', 'asset-chain'],
    })
    @IsString()
    @IsIn(['base', 'bnb-smart-chain', 'lisk', 'tron', 'celo', 'arbitrum-one', 'polygon', 'asset-chain'])
    network: string;
}
