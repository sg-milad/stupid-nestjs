import { Test } from "@nestjs/testing";
import { ICustomerRepository } from "../../../../src/domain/customer/repositories/customer.repository.interface";
import { Customer } from "../../../../src/domain/customer/entities/customer.entity";
import { PhoneNumber } from "../../../../src/domain/customer/value-objects/phone-number.value-object";
import { Email } from "../../../../src/domain/customer/value-objects/email.value-object";
import { BankAccount } from "../../../../src/domain/customer/value-objects/bank-account.value-object";
import { GetAllCustomersHandler, GetAllCustomersQuery } from "../../../../src/application/customer/queries";

describe('GetAllCustomersHandler', () => {
    let handler: GetAllCustomersHandler;
    let customerRepository: ICustomerRepository;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                GetAllCustomersHandler,
                {
                    provide: 'ICustomerRepository',
                    useValue: {
                        findAll: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = moduleRef.get<GetAllCustomersHandler>(GetAllCustomersHandler);
        customerRepository = moduleRef.get<ICustomerRepository>('ICustomerRepository');
    });

    it('should return all customers', async () => {
        // Arrange
        const query = new GetAllCustomersQuery();

        const phoneNumber1 = { getValue: () => '+447123456789' } as PhoneNumber;
        const email1 = { getValue: () => 'john.doe@example.com' } as Email;
        const bankAccount1 = { getValue: () => '12345678' } as BankAccount;

        const phoneNumber2 = { getValue: () => '+447987654321' } as PhoneNumber;
        const email2 = { getValue: () => 'jane.doe@example.com' } as Email;
        const bankAccount2 = { getValue: () => '87654321' } as BankAccount;

        const customer1 = {
            getId: () => '1',
            getFirstName: () => 'John',
            getLastName: () => 'Doe',
            getDateOfBirth: () => new Date('1990-01-01'),
            getPhoneNumber: () => phoneNumber1,
            getEmail: () => email1,
            getBankAccountNumber: () => bankAccount1,
        } as unknown as Customer;

        const customer2 = {
            getId: () => '2',
            getFirstName: () => 'Jane',
            getLastName: () => 'Doe',
            getDateOfBirth: () => new Date('1992-02-02'),
            getPhoneNumber: () => phoneNumber2,
            getEmail: () => email2,
            getBankAccountNumber: () => bankAccount2,
        } as unknown as Customer;

        jest.spyOn(customerRepository, 'findAll').mockResolvedValue([customer1, customer2]);

        // Act
        const result = await handler.execute(query);

        // Assert
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('1');
        expect(result[0].firstName).toBe('John');
        expect(result[0].lastName).toBe('Doe');
        expect(result[0].phoneNumber).toBe('+447123456789');
        expect(result[0].email).toBe('john.doe@example.com');
        expect(result[0].bankAccountNumber).toBe('12345678');

        expect(result[1].id).toBe('2');
        expect(result[1].firstName).toBe('Jane');
        expect(result[1].lastName).toBe('Doe');
        expect(result[1].phoneNumber).toBe('+447987654321');
        expect(result[1].email).toBe('jane.doe@example.com');
        expect(result[1].bankAccountNumber).toBe('87654321');
    });

    it('should return empty array when no customers found', async () => {
        // Arrange
        const query = new GetAllCustomersQuery();

        jest.spyOn(customerRepository, 'findAll').mockResolvedValue([]);

        // Act
        const result = await handler.execute(query);

        // Assert
        expect(result).toEqual([]);
    });
});