import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { TestingModule, Test } from "@nestjs/testing";
import { CreateCustomerCommand } from "./../../src/application/customer/commands/create-customer/create-customer.command";
import { CustomerDto } from "./../../src/application/customer/queries/get-customer/customer.dto";
import { GetCustomerQuery } from "./../../src/application/customer/queries/get-customer/get-customer.query";
import { CustomerController } from "./../../src/presentation/controllers/customer.controller";
import { CreateCustomerRequestDto } from "./../../src/presentation/dtos/create-customer.request.dto";
import { CustomerResponseDto } from "./../../src/presentation/dtos/customer.response.dto";
import { PhoneValidatorService } from "./../../src/infrastructure/validation/phone-validator.service";

describe('CustomerController', () => {
    let controller: CustomerController;
    let commandBus: CommandBus;
    let queryBus: QueryBus;
    let phoneValidatorService: PhoneValidatorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CustomerController],
            providers: [
                {
                    provide: CommandBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: QueryBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: PhoneValidatorService,
                    useValue: {
                        isValidMobileNumber: jest.fn().mockReturnValue(true),
                    },
                },
            ],
        }).compile();

        controller = module.get<CustomerController>(CustomerController);
        commandBus = module.get<CommandBus>(CommandBus);
        queryBus = module.get<QueryBus>(QueryBus);
        phoneValidatorService = module.get<PhoneValidatorService>(PhoneValidatorService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('createCustomer', () => {
        it('should execute CreateCustomerCommand and return the created customer ID', async () => {
            // Arrange
            const customerId = 'test-uuid';
            const createCustomerDto: CreateCustomerRequestDto = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                phoneNumber: '+12025550123',
                email: 'john.doe@example.com',
                bankAccountNumber: '12345678901234',
            };

            jest.spyOn(commandBus, 'execute').mockResolvedValue(customerId);
            jest.spyOn(phoneValidatorService, 'isValidMobileNumber').mockReturnValue(true);

            // Act
            const result = await controller.createCustomer(createCustomerDto);

            // Assert
            expect(commandBus.execute).toHaveBeenCalledWith(
                expect.any(CreateCustomerCommand)
            );

            // Verify the command was created correctly
            const executedCommand = (commandBus.execute as jest.Mock).mock.calls[0][0];
            expect(executedCommand).toBeInstanceOf(CreateCustomerCommand);
            expect(executedCommand.firstName).toBe(createCustomerDto.firstName);
            expect(executedCommand.lastName).toBe(createCustomerDto.lastName);
            expect(executedCommand.phoneNumber).toBe(createCustomerDto.phoneNumber);
            expect(executedCommand.email).toBe(createCustomerDto.email);
            expect(executedCommand.bankAccountNumber).toBe(createCustomerDto.bankAccountNumber);

            // Verify phone validation was called
            expect(phoneValidatorService.isValidMobileNumber).toHaveBeenCalledWith(createCustomerDto.phoneNumber);

            // Verify the response
            expect(result).toEqual({ id: customerId });
        });

        it('should throw an error when phone number is invalid', async () => {
            // Arrange
            const createCustomerDto: CreateCustomerRequestDto = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                phoneNumber: 'invalid-phone',
                email: 'john.doe@example.com',
                bankAccountNumber: '12345678901234',
            };

            jest.spyOn(phoneValidatorService, 'isValidMobileNumber').mockReturnValue(false);

            // Act & Assert
            await expect(controller.createCustomer(createCustomerDto)).rejects.toThrow();
            expect(phoneValidatorService.isValidMobileNumber).toHaveBeenCalledWith(createCustomerDto.phoneNumber);
            expect(commandBus.execute).not.toHaveBeenCalled();
        });
    });

    describe('getCustomer', () => {
        it('should execute GetCustomerQuery and return customer data', async () => {
            // Arrange
            const customerId = 'test-uuid';
            const customerDto = new CustomerDto(
                customerId,
                'John',
                'Doe',
                new Date('1990-01-01'),
                '+12025550123',
                'john.doe@example.com',
                '12345678901234'
            );

            jest.spyOn(queryBus, 'execute').mockResolvedValue(customerDto);

            // Act
            const result = await controller.getCustomer(customerId);

            // Assert
            expect(queryBus.execute).toHaveBeenCalledWith(
                expect.any(GetCustomerQuery)
            );

            // Verify the query was created correctly
            const executedQuery = (queryBus.execute as jest.Mock).mock.calls[0][0];
            expect(executedQuery).toBeInstanceOf(GetCustomerQuery);
            expect(executedQuery.id).toBe(customerId);

            // Verify the response
            expect(result).toBeInstanceOf(CustomerResponseDto);
            expect(result.id).toBe(customerDto.id);
            expect(result.firstName).toBe(customerDto.firstName);
            expect(result.lastName).toBe(customerDto.lastName);
            expect(result.phoneNumber).toBe(customerDto.phoneNumber);
            expect(result.email).toBe(customerDto.email);
            expect(result.bankAccountNumber).toBe(customerDto.bankAccountNumber);
        });
    });
});