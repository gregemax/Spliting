import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';

@ApiTags('payments')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new payment order',
    description: 'Creates a payment order with Paycrest API integration, including account verification and rate fetching.',
  })
  @ApiBody({
    type: CreatePaymentDto,
    description: 'Payment creation data',
    examples: {
      'create-payment': {
        summary: 'Create payment example',
        value: {
          amount: 1000,
          token: 'USDC',
          network: 'celo',
          recipient: {
            institution: 'OPAYNGPC',
            accountIdentifier: '1234567890',
            currency: 'NGN',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment order created successfully',
    schema: {
      type: 'object',
      properties: {
        order: {
          type: 'object',
          description: 'Order details from Paycrest API',
        },
        rate: {
          type: 'object',
          description: 'Exchange rate information',
        },
        verifyAcc: {
          type: 'object',
          description: 'Account verification result',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid account details' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all payments',
    description: 'Retrieves all payment records (placeholder implementation)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of payments retrieved',
    schema: {
      type: 'string',
      example: 'This action returns all payment',
    },
  })
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('tokens')
  @ApiTags('currencies')
  @ApiOperation({
    summary: 'Get available tokens',
    description: 'Retrieves list of available cryptocurrency tokens from Paycrest API',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available tokens',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Operation successful' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              symbol: { type: 'string', example: 'USDC' },
              name: { type: 'string', example: 'USD Coin' },
              decimals: { type: 'number', example: 6 },
            },
          },
        },
      },
    },
  })
  tokens() {
    return this.paymentService.tokens();
  }

  @Get('currencies')
  @ApiTags('currencies')
  @ApiOperation({
    summary: 'Get available currencies',
    description: 'Retrieves list of supported fiat currencies from Paycrest API',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available currencies',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Operation successful' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'NGN' },
              name: { type: 'string', example: 'Nigerian Naira' },
              symbol: { type: 'string', example: '₦' },
            },
          },
        },
      },
    },
  })
  currencies() {
    return this.paymentService.currencies();
  }

  @Get('institutions/:currency')
  @ApiTags('institutions')
  @ApiOperation({
    summary: 'Get institutions for currency',
    description: 'Retrieves list of financial institutions available for a specific currency',
  })
  @ApiParam({
    name: 'currency',
    description: 'Currency code (e.g., NGN, USD)',
    example: 'NGN',
  })
  @ApiResponse({
    status: 200,
    description: 'List of institutions for the specified currency',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Operation successful' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: '044' },
              name: { type: 'string', example: 'Access Bank' },
            },
          },
        },
      },
    },
  })
  getInstitutions(@Param('currency') currency: string) {
    return this.paymentService.getorder(currency);
  }

  @Get('orders/:id')
  @ApiTags('orders')
  @ApiOperation({
    summary: 'Get order details',
    description: 'Retrieves detailed information about a specific payment order, including status validation and descriptive messages',
  })
  @ApiParam({
    name: 'id',
    description: 'Order ID',
    example: 'order_123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Operation successful' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'order_123456789' },
            amount: { type: 'number', example: 1000 },
            amountPaid: { type: 'number', example: 1000 },
            amountReturned: { type: 'number', example: 0 },
            token: { type: 'string', example: 'USDC' },
            senderFee: { type: 'number', example: 5 },
            transactionFee: { type: 'number', example: 10 },
            rate: { type: 'number', example: 1500 },
            network: { type: 'string', example: 'base' },
            gatewayId: { type: 'string', example: 'gw_123' },
            recipient: {
              type: 'object',
              properties: {
                institution: { type: 'string', example: '044' },
                accountIdentifier: { type: 'string', example: '1234567890' },
                accountName: { type: 'string', example: 'John Doe' },
                memo: { type: 'string', example: 'With love from split' },
                providerId: { type: 'string', example: 'prov_123' },
                metadata: { type: 'object' },
                currency: { type: 'string', example: 'NGN' },
              },
            },
            fromAddress: { type: 'string', example: '0x123...' },
            returnAddress: { type: 'string', example: '0xb39...' },
            receiveAddress: { type: 'string', example: '0x456...' },
            feeAddress: { type: 'string', example: '0x789...' },
            reference: { type: 'string', example: 'ref_123' },
            createdAt: { type: 'string', example: '2023-11-07T05:31:56Z' },
            updatedAt: { type: 'string', example: '2023-11-07T05:31:56Z' },
            txHash: { type: 'string', example: '0xabc...' },
            status: {
              type: 'string',
              enum: ['initiated', 'pending', 'processing', 'cancelled', 'fulfilled', 'validated', 'settled', 'expired'],
              example: 'pending',
            },
            statusMessage: {
              type: 'string',
              example: 'Order awaiting provider assignment',
            },
            transactionLogs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'log_123' },
                  gateway_id: { type: 'string', example: 'gw_123' },
                  status: { type: 'string', example: 'pending' },
                  tx_hash: { type: 'string', example: '0xabc...' },
                  created_at: { type: 'string', example: '2023-11-07T05:31:56Z' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid API Key' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid order status' })
  getOrder(@Param('id') id: string) {
    return this.paymentService.orders(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get payment by ID',
    description: 'Retrieves a specific payment record by ID (placeholder implementation)',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    schema: {
      type: 'string',
      example: 'This action returns a #1 payment',
    },
  })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update payment',
    description: 'Updates a payment record (placeholder implementation)',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '1',
  })
  @ApiBody({
    type: UpdatePaymentDto,
    description: 'Payment update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    schema: {
      type: 'string',
      example: 'This action updates a #1 payment',
    },
  })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete payment',
    description: 'Deletes a payment record (placeholder implementation)',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment deleted successfully',
    schema: {
      type: 'string',
      example: 'This action removes a #1 payment',
    },
  })
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }

  @Post('verify-account')
  @ApiOperation({
    summary: 'Verify account details',
    description: 'Verifies bank account details using Paycrest API',
  })
  @ApiBody({
    type: VerifyAccountDto,
    description: 'Account verification data',
    examples: {
      'verify-account': {
        summary: 'Verify account example',
        value: {
          institution: 'OPAYNGPC',
          accountIdentifier: '1234567890',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account verification successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        message: { type: 'string', example: 'Operation successful' },
        data: {
          type: 'object',
          description: 'Account verification result',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid account details' })
  verifyAccount(@Body() verifyAccountDto: VerifyAccountDto) {
    return this.paymentService.verifyAccount(verifyAccountDto);
  }
}
