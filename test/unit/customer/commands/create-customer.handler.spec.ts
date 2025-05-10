import { Test } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { EventPublisher } from "@nestjs/cqrs";
import { CreateCustomerCommand } from "../../../../src/application/customer/commands/create-customer.command";
import { ICustomerRepository } from "../../../../src/domain/customer/repositories/customer.repository.interface";
import { Customer } from "../../../../src/domain/customer/entities/customer.entity";
import { PhoneNumber } from "../../../../src/domain/customer/value-objects/phone-number.value-object";
import { Email } from "../../../../src/domain/customer/value-objects/email.value-object";
import { BankAccount } from "../../../../src/domain/customer/value-objects/bank-account.value-object";
import { v4 as uuidv4 } from "uuid";
import { CreateCustomerHandler } from "src/application/customer/commands";

// Mock modules
jest.mock("../../../../src/domain/customer/value-objects/phone-number.value-object");
jest.mock("../../../../src/domain/customer/value-objects/email.value-object");
jest.mock("../../../../src/domain/customer/value-objects/bank-account.value-object");
jest.mock("../../../../src/domain/customer/entities/customer.entity");
jest.mock("uuid");

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
            const mockUuid = "test-uuid-1234";
            (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

            const command = new CreateCustomerCommand(
                "John",
                "Doe",
                new Date("1990-01-01"),
                "+12025550123",
                "john.doe@example.com",
                "12345678901234",
            );

            const mockPhoneNumber = { getValue: jest.fn().mockReturnValue("+12025550123") };
            const mockEmail = { getValue: jest.fn().mockReturnValue("john.doe@example.com") };
            const mockBankAccount = { getValue: jest.fn().mockReturnValue("12345678901234") };

            (PhoneNumber.create as jest.Mock).mockReturnValue(mockPhoneNumber);
            (Email.create as jest.Mock).mockReturnValue(mockEmail);
            (BankAccount.create as jest.Mock).mockReturnValue(mockBankAccount);

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
            expect(PhoneNumber.create).toHaveBeenCalledWith(command.phoneNumber);
            expect(Email.create).toHaveBeenCalledWith(command.email);
            expect(BankAccount.create).toHaveBeenCalledWith(command.bankAccountNumber);
            expect(uuidv4).toHaveBeenCalled();
            expect(Customer.create).toHaveBeenCalledWith(
                mockUuid,
                command.firstName,
                command.lastName,
                command.dateOfBirth,
                mockPhoneNumber,
                mockEmail,
                mockBankAccount
            );
            expect(customerRepository.exists).toHaveBeenCalledWith(command.firstName, command.lastName, command.dateOfBirth);
            expect(customerRepository.existsByEmail).toHaveBeenCalledWith(command.email);
            expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
            expect(mockCustomer.commit).toHaveBeenCalled();
            expect(result).toBe(mockUuid);
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
            await expect(handler.execute(command)).rejects.toThrow("Customer already exists");
            expect(customerRepository.exists).toHaveBeenCalledWith(command.firstName, command.lastName, command.dateOfBirth);
            expect(customerRepository.existsByEmail).not.toHaveBeenCalled();
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
            await expect(handler.execute(command)).rejects.toThrow(ConflictException);
            await expect(handler.execute(command)).rejects.toThrow("Email is already in use");
            expect(customerRepository.exists).toHaveBeenCalledWith(command.firstName, command.lastName, command.dateOfBirth);
            expect(customerRepository.existsByEmail).toHaveBeenCalledWith(command.email);
        });
    });
});