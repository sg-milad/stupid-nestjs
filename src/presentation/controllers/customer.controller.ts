import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateCustomerCommand } from '../../application/customer/commands/create-customer/create-customer.command';
import { GetCustomerQuery } from '../../application/customer/queries/get-customer/get-customer.query';
import { CreateCustomerRequestDto } from '../dtos/create-customer.request.dto';
import { CustomerResponseDto } from '../dtos/customer.response.dto';
import { CustomerDto } from '../../application/customer/queries/get-customer/customer.dto';
import { PhoneValidatorService } from '../../infrastructure/validation/phone-validator.service';

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly phoneValidatorService: PhoneValidatorService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: String,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - customer already exists',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerRequestDto,
  ): Promise<{ id: string }> {
    if (
      !this.phoneValidatorService.isValidMobileNumber(
        createCustomerDto.phoneNumber,
      )
    ) {
      throw new BadRequestException(
        'Phone number must be a valid mobile number',
      );
    }

    const dateOfBirth = new Date(createCustomerDto.dateOfBirth);

    const id = await this.commandBus.execute(
      new CreateCustomerCommand(
        createCustomerDto.firstName,
        createCustomerDto.lastName,
        dateOfBirth,
        createCustomerDto.phoneNumber,
        createCustomerDto.email,
        createCustomerDto.bankAccountNumber,
      ),
    );

    return { id };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'The customer was found',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomer(@Param('id') id: string): Promise<CustomerResponseDto> {
    const customerDto: CustomerDto = await this.queryBus.execute(
      new GetCustomerQuery(id),
    );
    const dob = new Date(customerDto.dateOfBirth);
    const response = new CustomerResponseDto();
    response.id = customerDto.id;
    response.firstName = customerDto.firstName;
    response.lastName = customerDto.lastName;
    response.dateOfBirth = dob.toISOString().split('T')[0];
    response.phoneNumber = customerDto.phoneNumber;
    response.email = customerDto.email;
    response.bankAccountNumber = customerDto.bankAccountNumber;

    return response;
  }
}
