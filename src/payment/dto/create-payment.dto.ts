import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';

class RecipientDto {
    @IsString()
    institution: string;

    @IsString()
    accountIdentifier: string;

    // @IsString()
    // accountName: string;

    @IsString()
    currency: string;
}

export class CreatePaymentDto {
    @IsNumber()
    amount: number;

    @IsString()
    token: string;


    // @IsNumber()
    // rate: number;

    recipient: RecipientDto;
}
