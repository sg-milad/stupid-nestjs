import { Test } from "@nestjs/testing";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { EventPublisher } from "@nestjs/cqrs";
import { ICustomerRepository } from "../../../../src/domain/customer/repositories/customer.repository.interface";
import { Customer } from "../../../../src/domain/customer/entities/customer.entity";
import { UpdateCustomerHandler, UpdateCustomerCommand } from "../../../../src/application/customer/commands";

describe('UpdateCustomerHandler', () => {
    let handler: UpdateCustomerHandler;
    let customerRepository: ICustomerRepository;
    let eventPublisher: EventPublisher;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                UpdateCustomerHandler,
                {
                    provide: 'ICustomerRepository',
                    useValue: {
                        findById: jest.fn(),
                        existsByEmail: jest.fn(),
                        findByIdentity: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: EventPublisher,
                    useValue: {
                        mergeObjectContext: jest.fn(),
                    },
                },
            ],
        }).compile();

        handler = moduleRef.get<UpdateCustomerHandler>(UpdateCustomerHandler);
        customerRepository = moduleRef.get<ICustomerRepository>('ICustomerRepository');
        eventPublisher = moduleRef.get<EventPublisher>(EventPublisher);
    });

    it('should update customer successfully', async () => {
        // Arrange
        const customerId = '123';
        const command = new UpdateCustomerCommand(
            customerId,
            'John',
            'Doe',
            new Date('1990-01-01'),
            '+447123456789',
            'john.doe@example.com',
            '12345678'
        );

        const existingCustomer = {
            getId: () => customerId,
            getEmail: () => ({ getValue: () => 'old.email@example.com' }),
            update: jest.fn(),
            commit: jest.fn(),
        } as unknown as Customer;

        jest.spyOn(customerRepository, 'findById').mockResolvedValue(existingCustomer);
        jest.spyOn(customerRepository, 'existsByEmail').mockResolvedValue(false);
        jest.spyOn(customerRepository, 'findByIdentity').mockResolvedValue(null);
        jest.spyOn(eventPublisher, 'mergeObjectContext').mockReturnValue(existingCustomer);

        // Act
        await handler.execute(command);

        // Assert
        expect(customerRepository.findById).toHaveBeenCalledWith(customerId);
        expect(customerRepository.existsByEmail).toHaveBeenCalledWith('john.doe@example.com');
        expect(customerRepository.update).toHaveBeenCalled();
        expect(existingCustomer.update).toHaveBeenCalled();
        expect(existingCustomer.commit).toHaveBeenCalled();
    });

    it('should throw NotFoundException when customer not found', async () => {
        // Arrange
        const command = new UpdateCustomerCommand(
            '123',
            'John',
            'Doe',
            new Date('1990-01-01'),
            '+447123456789',
            'john.doe@example.com',
            '12345678'
        );

        jest.spyOn(customerRepository, 'findById').mockResolvedValue(null);

        // Act & Assert
        await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when email already in use by another customer', async () => {
        // Arrange
        const customerId = '123';
        const command = new UpdateCustomerCommand(
            customerId,
            'John',
            'Doe',
            new Date('1990-01-01'),
            '+447123456789',
            'new.email@example.com',
            '12345678'
        );

        const existingCustomer = {
            getId: () => customerId,
            getEmail: () => ({ getValue: () => 'old.email@example.com' }),
        } as unknown as Customer;

        jest.spyOn(customerRepository, 'findById').mockResolvedValue(existingCustomer);
        jest.spyOn(customerRepository, 'existsByEmail').mockResolvedValue(true);

        // Act & Assert
        await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when another customer with same identity exists', async () => {
        // Arrange
        const customerId = '123';
        const command = new UpdateCustomerCommand(
            customerId,
            'John',
            'Doe',
            new Date('1990-01-01'),
            '+447123456789',
            'john.doe@example.com',
            '12345678'
        );

        const existingCustomer = {
            getId: () => customerId,
            getEmail: () => ({ getValue: () => 'john.doe@example.com' }),
        } as unknown as Customer;

        const anotherCustomer = {
            getId: () => '456',  // Different ID
        } as unknown as Customer;

        jest.spyOn(customerRepository, 'findById').mockResolvedValue(existingCustomer);
        jest.spyOn(customerRepository, 'existsByEmail').mockResolvedValue(false);
        jest.spyOn(customerRepository, 'findByIdentity').mockResolvedValue(anotherCustomer);

        // Act & Assert
        await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    });
});