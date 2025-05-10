import { TestingModule, Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Customer } from "./../../src/domain/customer/entities/customer.entity";
import { BankAccount } from "./../../src/domain/customer/value-objects/bank-account.value-object";
import { Email } from "./../../src/domain/customer/value-objects/email.value-object";
import { PhoneNumber } from "./../../src/domain/customer/value-objects/phone-number.value-object";
import { CustomerEntity } from "./../../src/infrastructure/persistence/entities/customer.orm-entity";
import { CustomerRepository } from "./../../src/infrastructure/persistence/repositories/customer.repository";
import { Repository } from "typeorm";

describe('CustomerRepository', () => {
    let repository: CustomerRepository;
    let ormRepository: Repository<CustomerEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CustomerRepository,
                {
                    provide: getRepositoryToken(CustomerEntity),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        count: jest.fn(),
                        createQueryBuilder: jest.fn(() => ({
                            where: jest.fn().mockReturnThis(),
                            andWhere: jest.fn().mockReturnThis(),
                            getCount: jest.fn().mockResolvedValue(0)
                        })),
                    },
                },
            ],
        }).compile();

        repository = module.get<CustomerRepository>(CustomerRepository);
        ormRepository = module.get<Repository<CustomerEntity>>(getRepositoryToken(CustomerEntity));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
        expect(ormRepository).toBeDefined();
    });

    describe('save', () => {
        it('should save a customer entity', async () => {
            // Arrange
            const customerId = 'test-uuid';
            const firstName = 'John';
            const lastName = 'Doe';
            const dateOfBirth = new Date('1990-01-01');
            const phoneNumberValue = '+12025550123';
            const emailValue = 'john.doe@example.com';
            const bankAccountValue = '12345678901234';

            const phoneNumber = { getValue: jest.fn().mockReturnValue(phoneNumberValue) } as unknown as PhoneNumber;
            const email = { getValue: jest.fn().mockReturnValue(emailValue) } as unknown as Email;
            const bankAccount = { getValue: jest.fn().mockReturnValue(bankAccountValue) } as unknown as BankAccount;

            const customerMock = {
                getId: jest.fn().mockReturnValue(customerId),
                getFirstName: jest.fn().mockReturnValue(firstName),
                getLastName: jest.fn().mockReturnValue(lastName),
                getDateOfBirth: jest.fn().mockReturnValue(dateOfBirth),
                getPhoneNumber: jest.fn().mockReturnValue(phoneNumber),
                getEmail: jest.fn().mockReturnValue(email),
                getBankAccountNumber: jest.fn().mockReturnValue(bankAccount),
            } as unknown as Customer;

            const saveSpy = jest.spyOn(ormRepository, 'save').mockResolvedValue({} as CustomerEntity);

            // Act
            await repository.save(customerMock);

            // Assert
            expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({
                id: customerId,
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: dateOfBirth,
                phoneNumber: phoneNumberValue,
                email: emailValue,
                bankAccountNumber: bankAccountValue,
            }));
        });
    });

    describe('findById', () => {
        it('should return a customer domain entity when found', async () => {
            // Arrange
            const customerId = 'test-uuid';
            const ormEntity: CustomerEntity = {
                id: customerId,
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                phoneNumber: '+12025550123',
                email: 'john.doe@example.com',
                bankAccountNumber: '12345678901234',
            } as CustomerEntity;

            jest.spyOn(ormRepository, 'findOne').mockResolvedValue(ormEntity);

            // Create mock objects and spy on static methods
            const mockPhoneNumber = { getValue: jest.fn() } as unknown as PhoneNumber;
            const mockEmail = { getValue: jest.fn() } as unknown as Email;
            const mockBankAccount = { getValue: jest.fn() } as unknown as BankAccount;
            const mockCustomer = { getId: jest.fn().mockReturnValue(customerId) } as unknown as Customer;

            jest.spyOn(PhoneNumber, 'create').mockReturnValue(mockPhoneNumber);
            jest.spyOn(Email, 'create').mockReturnValue(mockEmail);
            jest.spyOn(BankAccount, 'create').mockReturnValue(mockBankAccount);
            jest.spyOn(Customer, 'create').mockReturnValue(mockCustomer);

            // Act
            const result = await repository.findById(customerId);

            // Assert
            expect(ormRepository.findOne).toHaveBeenCalledWith({ where: { id: customerId } });
            expect(PhoneNumber.create).toHaveBeenCalledWith(ormEntity.phoneNumber);
            expect(Email.create).toHaveBeenCalledWith(ormEntity.email);
            expect(BankAccount.create).toHaveBeenCalledWith(ormEntity.bankAccountNumber);
            expect(result).toBeDefined();
        });

        it('should return null when customer is not found', async () => {
            // Arrange
            const customerId = 'non-existent-id';
            jest.spyOn(ormRepository, 'findOne').mockResolvedValue(null);

            // Act
            const result = await repository.findById(customerId);

            // Assert
            expect(ormRepository.findOne).toHaveBeenCalledWith({ where: { id: customerId } });
            expect(result).toBeNull();
        });
    });

    describe('exists', () => {
        it('should return true when customer exists', async () => {
            // Arrange
            const firstName = 'John';
            const lastName = 'Doe';
            const dateOfBirth = new Date('1990-01-01');

            const queryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(1),
            };

            jest.spyOn(ormRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

            // Act
            const result = await repository.exists(firstName, lastName, dateOfBirth);

            // Assert
            expect(ormRepository.createQueryBuilder).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return false when customer does not exist', async () => {
            // Arrange
            const firstName = 'Jane';
            const lastName = 'Smith';
            const dateOfBirth = new Date('1985-05-15');

            const queryBuilder = {
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0),
            };

            jest.spyOn(ormRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

            // Act
            const result = await repository.exists(firstName, lastName, dateOfBirth);

            // Assert
            expect(ormRepository.createQueryBuilder).toHaveBeenCalled();
            expect(queryBuilder.where).toHaveBeenCalledWith('c.firstName = :firstName', { firstName });
            expect(queryBuilder.andWhere).toHaveBeenCalledWith(expect.stringContaining('dateOfBirth'), expect.anything());
            expect(queryBuilder.getCount).toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('existsByEmail', () => {
        it('should return true when email exists', async () => {
            // Arrange
            const email = 'existing@example.com';

            jest.spyOn(ormRepository, 'count').mockResolvedValue(1);

            // Act
            const result = await repository.existsByEmail(email);

            // Assert
            expect(ormRepository.count).toHaveBeenCalledWith({
                where: { email }
            });
            expect(result).toBe(true);
        });

        it('should return false when email does not exist', async () => {
            // Arrange
            const email = 'new@example.com';

            jest.spyOn(ormRepository, 'count').mockResolvedValue(0);

            // Act
            const result = await repository.existsByEmail(email);

            // Assert
            expect(ormRepository.count).toHaveBeenCalledWith({
                where: { email }
            });
            expect(result).toBe(false);
        });
    });
});