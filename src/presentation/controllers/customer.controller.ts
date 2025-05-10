import { Body, Controller, Get, Param, Post, BadRequestException, UsePipes, ValidationPipe, Delete, Put } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiOkResponse, ApiNoContentResponse } from "@nestjs/swagger";
import { CreateCustomerCommand } from "../../application/customer/commands/create-customer.command";
import { GetCustomerQuery } from "../../application/customer/queries/get-customer.query";
import { CreateCustomerRequestDto } from "../dtos/create-customer.request.dto";
import { CustomerResponseDto } from "../dtos/customer.response.dto";
import { PhoneValidatorService } from "../../infrastructure/validation/phone-validator.service";
import { CustomerDto } from "src/application/customer/queries/customer.dto";
import { GetAllCustomersQuery } from "src/application/customer/queries/get-all-customer.query";
import { DeleteCustomerCommand } from "src/application/customer/commands/delete-customer.command";
import { UpdateCustomerCommand } from "src/application/customer/commands/update-customer.command";
import { UpdateCustomerRequestDto } from "../dtos/update-customer.request.dto";

@ApiTags("customers")
@Controller("customers")
export class CustomerController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly phoneValidatorService: PhoneValidatorService,
    ) { }

    @Post()
    @ApiOperation({ summary: "Create a new customer" })
    @ApiResponse({
        status: 201,
        description: "Customer created successfully",
        type: String,
    })
    @ApiResponse({ status: 400, description: "Bad request - validation error" })
    @ApiResponse({
        status: 409,
        description: "Conflict - customer already exists",
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async createCustomer(@Body() createCustomerDto: CreateCustomerRequestDto): Promise<{ id: string }> {
        if (!this.phoneValidatorService.isValidMobileNumber(createCustomerDto.phoneNumber)) {
            throw new BadRequestException("Phone number must be a valid mobile number");
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

    @Get(":id")
    @ApiOperation({ summary: "Get a customer by ID" })
    @ApiParam({ name: "id", description: "Customer ID" })
    @ApiResponse({
        status: 200,
        description: "The customer was found",
        type: CustomerResponseDto,
    })
    @ApiResponse({ status: 404, description: "Customer not found" })
    async getCustomer(@Param("id") id: string): Promise<CustomerResponseDto> {
        const customerDto = await this.queryBus.execute(new GetCustomerQuery(id));
        const response = new CustomerResponseDto();

        response.id = customerDto.id;
        response.firstName = customerDto.firstName;
        response.lastName = customerDto.lastName;
        response.dateOfBirth = new Date(customerDto.dateOfBirth);
        response.phoneNumber = customerDto.phoneNumber;
        response.email = customerDto.email;
        response.bankAccountNumber = customerDto.bankAccountNumber;

        return response;
    }

    @Get()
    @ApiOkResponse({
        description: 'List of all customers',
        type: [CustomerResponseDto]
    })
    async getAllCustomers(): Promise<CustomerResponseDto[]> {
        const query = new GetAllCustomersQuery();
        const customerDtos = await this.queryBus.execute<GetAllCustomersQuery, CustomerDto[]>(query);

        return customerDtos.map(customerDto => this.mapToResponseDto(customerDto));
    }

    @Delete(":id")
    @ApiParam({ name: 'id', description: 'Customer ID' })
    @ApiNoContentResponse({
        description: 'Customer has been deleted successfully'
    })
    async deleteCustomer(@Param("id") id: string): Promise<void> {
        const command = new DeleteCustomerCommand(id);
        await this.commandBus.execute(command);
    }

    @Put(":id")
    @ApiParam({ name: 'id', description: 'Customer ID' })
    @ApiOkResponse({
        description: 'Customer has been updated successfully',
        type: CustomerResponseDto
    })
    async updateCustomer(
        @Param("id") id: string,
        @Body() updateCustomerDto: UpdateCustomerRequestDto
    ): Promise<CustomerResponseDto> {
        const command = new UpdateCustomerCommand(
            id,
            updateCustomerDto.firstName,
            updateCustomerDto.lastName,
            new Date(updateCustomerDto.dateOfBirth),
            updateCustomerDto.phoneNumber,
            updateCustomerDto.email,
            updateCustomerDto.bankAccountNumber,
        );

        await this.commandBus.execute(command);

        const query = new GetCustomerQuery(id);
        const customerDto = await this.queryBus.execute<GetCustomerQuery, CustomerDto>(query);

        return this.mapToResponseDto(customerDto);
    }

    private mapToResponseDto(customerDto: CustomerDto): CustomerResponseDto {
        const response = new CustomerResponseDto();
        response.id = customerDto.id;
        response.firstName = customerDto.firstName;
        response.lastName = customerDto.lastName;
        response.dateOfBirth = new Date(customerDto.dateOfBirth);
        response.phoneNumber = customerDto.phoneNumber;
        response.email = customerDto.email;
        response.bankAccountNumber = customerDto.bankAccountNumber;
        return response;
    }
}
