import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class PaymentService {
  constructor(private configService: ConfigService) {}
  async create(createPaymentDto: CreatePaymentDto) {
    const rate = await fetch(
      `https://api.paycrest.io/v1/rates/${createPaymentDto.token}/${createPaymentDto.amount}/${createPaymentDto.recipient.currency}`,
      {
        method: 'GET',
      },
    );
    let rates = await rate.json();

    console.log('rate', rates?.data);

    let vir = {
      institution: createPaymentDto.recipient.institution,
      accountIdentifier: createPaymentDto.recipient.accountIdentifier,
    };
    const verifyAcc = await fetch('https://api.paycrest.io/v1/verify-account', {
      method: 'POST',
      headers: {
        'API-Key': this.configService.get<string>('API_KEY') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(vir),
    });

    let viracc = await verifyAcc.json();
    if (viracc.status != 'success') {
      throw new BadRequestException(
        'wrong account number or bankname check and try again ',
      );
    }
    console.log('Verified Account:', viracc.data);

    // Validate token
    const supportedTokens = await this.tokens();
    if (!supportedTokens.data || !supportedTokens.data.some(token => token.symbol === createPaymentDto.token)) {
      throw new BadRequestException(`Token '${createPaymentDto.token}' is not supported or configured`);
    }

    const orderData = {
      amount: createPaymentDto.amount,
      token: createPaymentDto.token,
      network: "celo",
      rate: rates?.data, 
      recipient: {
        institution: createPaymentDto.recipient.institution,
        accountIdentifier: createPaymentDto.recipient.accountIdentifier,
        accountName: viracc.data,
        currency: createPaymentDto.recipient.currency,
        memo: 'With love from split ',
      },
     
      returnAddress: '0xb39b7c02372dBBb003c05D6b4ABA2eC68842934D',
    };

    const response = await fetch('https://api.paycrest.io/v1/sender/orders', {
      method: 'POST',
      headers: {
        'API-Key': this.configService.get<string>('API_KEY') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    let order = await response.json();
    console.log('Order created:', order);

    if (order.status !== 'success') {
      // Handle rate not achievable by retrying with available rate
      if (order.data && order.data.field === 'Rate' && order.data.message.includes('Available rate is')) {
        const availableRateMatch = order.data.message.match(/Available rate is (\d+\.\d+)/);
        if (availableRateMatch) {
          const availableRate = parseFloat(availableRateMatch[1]);
          orderData.rate = availableRate;

          const retryResponse = await fetch('https://api.paycrest.io/v1/sender/orders', {
            method: 'POST',
            headers: {
              'API-Key': this.configService.get<string>('API_KEY') || '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
          });

          order = await retryResponse.json();
          console.log('Order created after retry:', order);

          if (order.status === 'success') {
            return {
              order,
              rate: availableRate.toString(),
              verifyAcc: viracc.data,
            };
          } else {
            const retryErrorMessage = order.data ? `${order.data.field}: ${order.data.message}` : order.message;
            throw new BadRequestException(retryErrorMessage || 'Failed to create order after retry');
          }
        }
      }

      const errorMessage = order.data ? `${order.data.field}: ${order.data.message}` : order.message;
      throw new BadRequestException(errorMessage || 'Failed to create order');
    }
    return {
      order,
      rate: rates?.data,
      verifyAcc: viracc.data,
    };
  }

  async getorder(currency) {
    const institutions = await fetch(
      `https://api.paycrest.io/v1/institutions/${currency}`,
      {
        method: 'GET',
      },
    );

    return await institutions.json() ;
  }

  async currencies() {
    const currencies = await fetch(`https://api.paycrest.io/v1/currencies`, {
      method: 'GET',
    });
    return currencies.json();
  }
  async tokens() {
    const currencies = await fetch(`https://api.paycrest.io/v1/tokens`, {
      method: 'GET',
    });
    return await currencies.json();
  }

    async orders (id) {
    const currencies = await fetch(`https://api.paycrest.io/v1/sender/orders/${id}`, {
      method: 'GET',
      headers: {
        'API-Key': this.configService.get<string>('API_KEY') || '',
        'Content-Type': 'application/json',
      },
    });

    if (currencies.status == 401) {
      throw new UnauthorizedException('Invalid API Key');
    }

    const response = await currencies.json();

    // Validate order status
    if (response.data && response.data.status) {
      const validStatuses = Object.values(OrderStatus);
      if (!validStatuses.includes(response.data.status)) {
        throw new BadRequestException(`Invalid order status: ${response.data.status}`);
      }

      // Add status-based message
      let statusMessage = '';
      switch (response.data.status) {
        case OrderStatus.INITIATED:
          statusMessage = 'Order initiated via API (before Gateway creation)';
          break;
        case OrderStatus.PENDING:
          statusMessage = 'Order awaiting provider assignment';
          break;
        case OrderStatus.PROCESSING:
          statusMessage = 'Order being processed by provider';
          break;
        case OrderStatus.CANCELLED:
          statusMessage = 'Order cancelled by provider';
          break;
        case OrderStatus.FULFILLED:
          statusMessage = 'Order fulfilled by provider';
          break;
        case OrderStatus.VALIDATED:
          statusMessage = 'Order validated and ready for settlement';
          break;
        case OrderStatus.SETTLED:
          statusMessage = 'Order fully completed on blockchain';
          break;
        case OrderStatus.EXPIRED:
          statusMessage = 'Order expired because no transfer was made to the receive address within the time limit';
          break;
      }

      response.data.statusMessage = statusMessage;
    }

    return response;
  }
  findAll() {
    return `This action returns all payment`;
  }
  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }

 async verifyAccount(vir: VerifyAccountDto) {
   try {
     const verifyAcc = await fetch('https://api.paycrest.io/v1/verify-account', {
       method: 'POST',
       headers: {
         'API-Key': this.configService.get<string>('API_KEY') || '',
         'Content-Type': 'application/json',
       },
       body: JSON.stringify(vir),
     });

     if (!verifyAcc.ok) {
       throw new HttpException(
         `Paycrest API error: ${verifyAcc.status} ${verifyAcc.statusText}`,
         verifyAcc.status,
       );
     }

     let viracc = await verifyAcc.json();
     return viracc;
   } catch (error) {
     if (error instanceof HttpException) {
       throw error;
     }
     throw new HttpException(
       'Failed to verify account: ' + error.message,
       500,
     );
   }
 }
}
