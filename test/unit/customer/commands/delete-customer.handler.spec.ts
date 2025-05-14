import { Test } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { EventPublisher } from "@nestjs/cqrs";
import { Customer } from "../../../../src/domain/customer/entities/customer.entity";
import { DeleteCustomerHandler, DeleteCustomerCommand } from "../../../../src/application/customer/commands";
import { ICustomerRepository } from "../../../../src/domain/customer/repositories/customer.repository.interface";

describe('DeleteCustomerHandler', () => {
    let handler: DeleteCustomerHandler;
    let customerRepository: ICustomerRepository;
    let eventPublisher: EventPublisher;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                DeleteCustomerHandler,
                {
                    provide: 'ICustomerRepository',
                    useValue: {
                        findById: jest.fn(),
                        delete: jest.fn(),
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

        handler = moduleRef.get<DeleteCustomerHandler>(DeleteCustomerHandler);
        customerRepository = moduleRef.get<ICustomerRepository>('ICustomerRepository');
        eventPublisher = moduleRef.get<EventPublisher>(EventPublisher);
    });

    it('should delete customer successfully', async () => {
        // Arrange
        const customerId = '123';
        const command = new DeleteCustomerCommand(customerId);

        const existingCustomer = {
            getId: () => customerId,
            delete: jest.fn(),
            commit: jest.fn(),
        } as unknown as Customer;

        jest.spyOn(customerRepository, 'findById').mockResolvedValue(existingCustomer);
        jest.spyOn(eventPublisher, 'mergeObjectContext').mockReturnValue(existingCustomer);

        // Act
        await handler.execute(command);

        // Assert
        expect(customerRepository.findById).toHaveBeenCalledWith(customerId);
        expect(customerRepository.delete).toHaveBeenCalledWith(customerId);
        expect(existingCustomer.delete).toHaveBeenCalled();
        expect(existingCustomer.commit).toHaveBeenCalled();
    });

    it('should throw NotFoundException when customer not found', async () => {
        // Arrange
        const customerId = '123';
        const command = new DeleteCustomerCommand(customerId);

        jest.spyOn(customerRepository, 'findById').mockResolvedValue(null);

        // Act & Assert
        await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
        expect(customerRepository.findById).toHaveBeenCalledWith(customerId);
        expect(customerRepository.delete).not.toHaveBeenCalled();
    });
});