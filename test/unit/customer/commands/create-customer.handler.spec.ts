import { Test } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { EventPublisher } from "@nestjs/cqrs";
import { CreateCustomerHandler } from "../../../../src/application/customer/commands/create-customer/create-customer.handler";
import { CreateCustomerCommand } from "../../../../src/application/customer/commands/create-customer/create-customer.command";
import { ICustomerRepository } from "../../../../src/domain/customer/repositories/customer.repository.interface";
import { Customer } from "../../../../src/domain/customer/entities/customer.entity";

// Mock modules
jest.mock("../../../../src/domain/customer/value-objects/phone-number.value-object");
jest.mock("../../../../src/domain/customer/value-objects/email.value-object");
jest.mock("../../../../src/domain/customer/value-objects/bank-account.value-object");
jest.mock("../../../../src/domain/customer/entities/customer.entity");

describe("CreateCustomerHandler", () => {
    let handler: CreateCustomerHandler;
    let customerRepository: ICustomerRepository;
    let eventPublisher: EventPublisher;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                CreateCustomerHandler,
                {
                    provide: "ICustomerRepository",
                    useValue: {
                        exists: jest.fn(),
                        existsByEmail: jest.fn(),
                        save: jest.fn(),
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

        handler = moduleRef.get<CreateCustomerHandler>(CreateCustomerHandler);
        customerRepository = moduleRef.get<ICustomerRepository>("ICustomerRepository");
        eventPublisher = moduleRef.get<EventPublisher>(EventPublisher);
    });

    describe("execute", () => {
        it("should create a customer when it does not exist", async () => {
            // Arrange
            const command = new CreateCustomerCommand(
                "John",
                "Doe",
                new Date("1990-01-01"),
                "+12025550123",
                "john.doe@example.com",
                "12345678901234",
            );

            // Mock repository methods
            jest.spyOn(customerRepository, "exists").mockResolvedValue(false);
            jest.spyOn(customerRepository, "existsByEmail").mockResolvedValue(false);

            // Mock the customer aggregate
            const mockCustomer = {
                commit: jest.fn(),
            };

            // Mock the publisher
            jest.spyOn(eventPublisher, "mergeObjectContext").mockReturnValue(mockCustomer as any);

            // Mock Customer.create static method
            jest.spyOn(Customer, "create").mockReturnValue(mockCustomer as any);

            // Act
            const result = await handler.execute(command);

            // Assert
            expect(customerRepository.exists).toHaveBeenCalledWith(command.firstName, command.lastName, command.dateOfBirth);
            expect(customerRepository.existsByEmail).toHaveBeenCalledWith(command.email);
            expect(customerRepository.save).toHaveBeenCalled();
            expect(mockCustomer.commit).toHaveBeenCalled();
            expect(result).toBeDefined(); // Should return an ID
        });

        it("should throw ConflictException if customer with same identity exists", async () => {
            // Arrange
            const command = new CreateCustomerCommand(
                "John",
                "Doe",
                new Date("1990-01-01"),
                "+12025550123",
                "john.doe@example.com",
                "12345678901234",
            );

            // Mock repository to return existing customer
            jest.spyOn(customerRepository, "exists").mockResolvedValue(true);

            // Act & Assert
            await expect(handler.execute(command)).rejects.toThrow(ConflictException);
        });

        it("should throw ConflictException if email already exists", async () => {
            // Arrange
            const command = new CreateCustomerCommand(
                "John",
                "Doe",
                new Date("1990-01-01"),
                "+12025550123",
                "john.doe@example.com",
                "12345678901234",
            );

            // Mock repository methods
            jest.spyOn(customerRepository, "exists").mockResolvedValue(false);
            jest.spyOn(customerRepository, "existsByEmail").mockResolvedValue(true);

            // Act & Assert
        });
    });
});
