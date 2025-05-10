import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICustomerRepository } from '../../../domain/customer/repositories/customer.repository.interface';
import { Customer } from '../../../domain/customer/entities/customer.entity';
import { CustomerEntity } from '../entities/customer.orm-entity';
import { PhoneNumber } from '../../../domain/customer/value-objects/phone-number.value-object';
import { Email } from '../../../domain/customer/value-objects/email.value-object';
import { BankAccount } from '../../../domain/customer/value-objects/bank-account.value-object';

@Injectable()
export class CustomerRepository implements ICustomerRepository {
    constructor(
        @InjectRepository(CustomerEntity)
        private readonly customerRepository: Repository<CustomerEntity>,
    ) { }

    async save(customer: Customer): Promise<void> {
        const customerOrmEntity = this.mapToOrmEntity(customer);
        await this.customerRepository.save(customerOrmEntity);
    }

    async findById(id: string): Promise<Customer | null> {
        const customerOrmEntity = await this.customerRepository.findOne({ where: { id } });
        if (!customerOrmEntity) {
            return null;
        }

        return this.mapToDomainEntity(customerOrmEntity);
    }

    async findByEmail(email: string): Promise<Customer | null> {
        const customerOrmEntity = await this.customerRepository.findOne({ where: { email } });
        if (!customerOrmEntity) {
            return null;
        }

        return this.mapToDomainEntity(customerOrmEntity);
    }

    async findByIdentity(
        firstName: string,
        lastName: string,
        dateOfBirth: Date,
    ): Promise<Customer | null> {
        const customerOrmEntity = await this.customerRepository.findOne({
            where: {
                firstName,
                lastName,
                dateOfBirth,
            },
        });

        if (!customerOrmEntity) {
            return null;
        }

        return this.mapToDomainEntity(customerOrmEntity);
    }

    async exists(
        firstName: string,
        lastName: string,
        dateOfBirth: Date,
        email: string
    ): Promise<boolean> {
        const dob = dateOfBirth.toISOString().substring(0, 10);

        const count = await this.customerRepository
            .createQueryBuilder('c')
            .where('c.firstName = :firstName', { firstName })
            .andWhere('c.lastName = :lastName', { lastName })
            .andWhere('DATE(c.dateOfBirth) = :dob', { dob })
            .where('c.email = :email', { email: email.toLowerCase() })
            .getCount();

        return count > 0;
    }


    async existsByEmail(email: string): Promise<boolean> {
        const count = await this.customerRepository.count({
            where: { email },
        });

        return count > 0;
    }

    private mapToOrmEntity(customer: Customer): CustomerEntity {
        const customerOrmEntity = new CustomerEntity();
        customerOrmEntity.id = customer.getId();
        customerOrmEntity.firstName = customer.getFirstName();
        customerOrmEntity.lastName = customer.getLastName();
        customerOrmEntity.dateOfBirth = customer.getDateOfBirth();
        customerOrmEntity.phoneNumber = customer.getPhoneNumber().getValue();
        customerOrmEntity.email = customer.getEmail().getValue();
        customerOrmEntity.bankAccountNumber = customer.getBankAccountNumber().getValue();

        return customerOrmEntity;
    }

    private mapToDomainEntity(customerOrmEntity: CustomerEntity): Customer {
        const phoneNumber = PhoneNumber.create(customerOrmEntity.phoneNumber);
        const email = Email.create(customerOrmEntity.email);
        const bankAccountNumber = BankAccount.create(customerOrmEntity.bankAccountNumber);

        return new Customer(
            customerOrmEntity.id,
            customerOrmEntity.firstName,
            customerOrmEntity.lastName,
            customerOrmEntity.dateOfBirth,
            phoneNumber,
            email,
            bankAccountNumber,
        );
    }
}