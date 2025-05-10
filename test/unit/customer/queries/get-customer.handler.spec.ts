import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { GetCustomerQuery } from "../../../../src/application/customer/queries/get-customer.query";
import { ICustomerRepository } from "../../../../src/domain/customer/repositories/customer.repository.interface";
import { Customer } from "../../../../src/domain/customer/entities/customer.entity";
import { PhoneNumber } from "../../../../src/domain/customer/value-objects/phone-number.value-object";
import { Email } from "../../../../src/domain/customer/value-objects/email.value-object";
import { BankAccount } from "../../../../src/domain/customer/value-objects/bank-account.value-object";
import { CustomerDto } from "../../../../src/application/customer/queries/customer.dto";
import { GetCustomerHandler } from "src/application/customer/queries";

describe('GetCustomerHandler', () => {
    let handler: GetCustomerHandler;
    let customerRepository: ICustomerRepository;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                GetCustomerHandler,
                {
                    provide: 'ICustomerRepository',
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = moduleRef.get<GetCustomerHandler>(GetCustomerHandler);
        customerRepository = moduleRef.get<ICustomerRepository>('ICustomerRepository');
    });

    describe('execute', () => {
        it('should return a customer when it exists', async () => {
            // Arrange
            const customerId = 'test-uuid';
            const query = new GetCustomerQuery(customerId);

            const testDate = new Date('1990-01-01');
            const phoneNumberValue = '+12025550123';
            const emailValue = 'john.doe@example.com';
            const bankAccountValue = '12345678901234';

            const phoneNumberMock = { getValue: jest.fn().mockReturnValue(phoneNumberValue) } as unknown as PhoneNumber;
            const emailMock = { getValue: jest.fn().mockReturnValue(emailValue) } as unknown as Email;
            const bankAccountMock = { getValue: jest.fn().mockReturnValue(bankAccountValue) } as unknown as BankAccount;

            const customerMock = {
                getId: jest.fn().mockReturnValue(customerId),
                getFirstName: jest.fn().mockReturnValue('John'),
                getLastName: jest.fn().mockReturnValue('Doe'),
                getDateOfBirth: jest.fn().mockReturnValue(testDate),
                getPhoneNumber: jest.fn().mockReturnValue(phoneNumberMock),
                getEmail: jest.fn().mockReturnValue(emailMock),
                getBankAccountNumber: jest.fn().mockReturnValue(bankAccountMock),
            } as unknown as Customer;

            jest.spyOn(customerRepository, 'findById').mockResolvedValue(customerMock);

            // Act
            const result = await handler.execute(query);

            // Assert
            expect(customerRepository.findById).toHaveBeenCalledWith(customerId);
            expect(result).toBeInstanceOf(CustomerDto);
            expect(result).toEqual({
                id: customerId,
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: testDate,
                phoneNumber: phoneNumberValue,
                email: emailValue,
                bankAccountNumber: bankAccountValue,
            });
        });

        it('should throw NotFoundException when customer does not exist', async () => {
            // Arrange
            const customerId = 'non-existent-uuid';
            const query = new GetCustomerQuery(customerId);

            jest.spyOn(customerRepository, 'findById').mockResolvedValue(null);

            // Act & Assert
            await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
            await expect(handler.execute(query)).rejects.toThrow(`Customer with id ${customerId} not found`);
            expect(customerRepository.findById).toHaveBeenCalledWith(customerId);
        });

        it('should properly map customer entity to DTO', async () => {
            // Arrange
            const customerId = 'test-uuid';
            const firstName = 'Jane';
            const lastName = 'Smith';
            const dateOfBirth = new Date('1985-05-15');
            const phoneNumberValue = '+16175551234';
            const emailValue = 'jane.smith@example.com';
            const bankAccountValue = '9876543210123';

            const query = new GetCustomerQuery(customerId);

            const phoneNumberMock = { getValue: jest.fn().mockReturnValue(phoneNumberValue) } as unknown as PhoneNumber;
            const emailMock = { getValue: jest.fn().mockReturnValue(emailValue) } as unknown as Email;
            const bankAccountMock = { getValue: jest.fn().mockReturnValue(bankAccountValue) } as unknown as BankAccount;

            const customerMock = {
                getId: jest.fn().mockReturnValue(customerId),
                getFirstName: jest.fn().mockReturnValue(firstName),
                getLastName: jest.fn().mockReturnValue(lastName),
                getDateOfBirth: jest.fn().mockReturnValue(dateOfBirth),
                getPhoneNumber: jest.fn().mockReturnValue(phoneNumberMock),
                getEmail: jest.fn().mockReturnValue(emailMock),
                getBankAccountNumber: jest.fn().mockReturnValue(bankAccountMock),
            } as unknown as Customer;

            jest.spyOn(customerRepository, 'findById').mockResolvedValue(customerMock);

            // Act
            const result = await handler.execute(query);

            // Assert
            expect(result.id).toBe(customerId);
            expect(result.firstName).toBe(firstName);
            expect(result.lastName).toBe(lastName);
            expect(result.dateOfBirth).toBe(dateOfBirth);
            expect(result.phoneNumber).toBe(phoneNumberValue);
            expect(result.email).toBe(emailValue);
            expect(result.bankAccountNumber).toBe(bankAccountValue);

            // Verify all getter methods were called
            expect(customerMock.getId).toHaveBeenCalled();
            expect(customerMock.getFirstName).toHaveBeenCalled();
            expect(customerMock.getLastName).toHaveBeenCalled();
            expect(customerMock.getDateOfBirth).toHaveBeenCalled();
            expect(customerMock.getPhoneNumber).toHaveBeenCalled();
            expect(customerMock.getEmail).toHaveBeenCalled();
            expect(customerMock.getBankAccountNumber).toHaveBeenCalled();

            // Verify value object getValue methods were called
            expect(phoneNumberMock.getValue).toHaveBeenCalled();
            expect(emailMock.getValue).toHaveBeenCalled();
            expect(bankAccountMock.getValue).toHaveBeenCalled();
        });
    });
});