// test/bdd/step-definitions/common.steps.ts
import { Before, Given } from '@cucumber/cucumber';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TestAppModule } from '../config/test-app.module';
import { CustomerEntity } from '../../../src/infrastructure/persistence/entities/customer.orm-entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';

let app: INestApplication;
let customerRepository: Repository<CustomerEntity>;
let testCustomers = new Map<string, CustomerEntity>();
let currentResponse: any;
let errorResponse: any;

// This will be used to share state between steps
export const testContext = {
    app: undefined as INestApplication | undefined,
    customerRepository: undefined as Repository<CustomerEntity> | undefined,
    testCustomers: new Map<string, CustomerEntity>(),
    currentResponse: undefined as any,
    errorResponse: undefined as any,
    createdCustomerId: undefined as string | undefined,
};

Before(async () => {
    // Create a testing module
    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [TestAppModule],
    }).compile();

    // Create the NestJS application
    app = moduleFixture.createNestApplication();
    await app.init();

    // Get the customer repository
    customerRepository = app.get(getRepositoryToken(CustomerEntity));

    // Clear the database before each scenario
    await customerRepository.clear();

    // Reset test context
    testContext.app = app;
    testContext.customerRepository = customerRepository;
    testContext.testCustomers.clear();
    testContext.currentResponse = undefined;
    testContext.errorResponse = undefined;
    testContext.createdCustomerId = undefined;
});

Given('the system is ready to accept customer data', () => {
    // Nothing to do here, the system is already set up by the Before hook
});

Given('the system has customers stored', async () => {
    // Create a few sample customers for testing
    const customers = [
        {
            id: uuidv4(),
            firstName: 'Sample',
            lastName: 'User',
            dateOfBirth: new Date('1990-01-01'),
            phoneNumber: '+447911123456',
            email: 'sample.user@example.com',
            bankAccountNumber: 'GB29NWBK60161331926819',
        },
        {
            id: uuidv4(),
            firstName: 'Another',
            lastName: 'Person',
            dateOfBirth: new Date('1985-05-15'),
            phoneNumber: '+447911123457',
            email: 'another.person@example.com',
            bankAccountNumber: 'GB29NWBK60161331926820',
        },
    ];

    // Save the sample customers to the database
    for (const customer of customers) {
        const customerEntity = new CustomerEntity();
        Object.assign(customerEntity, customer);
        await customerRepository.save(customerEntity);
        testContext.testCustomers.set(customer.id, customerEntity);
    }
});

Given('a customer with ID exists in the system', async () => {
    // Use the first test customer
    const customer = Array.from(testContext.testCustomers.values())[0];
    testContext.createdCustomerId = customer.id;
});

Given('another customer with different ID exists', async () => {
    // Use the second test customer
    const customers = Array.from(testContext.testCustomers.values());
    if (customers.length >= 2) {
        // We already have enough customers
    } else {
        // Create another customer
        const customer = {
            id: uuidv4(),
            firstName: 'Second',
            lastName: 'Customer',
            dateOfBirth: new Date('1992-03-20'),
            phoneNumber: '+447911123458',
            email: 'second.customer@example.com',
            bankAccountNumber: 'GB29NWBK60161331926821',
        };
        const customerEntity = new CustomerEntity();
        Object.assign(customerEntity, customer);
        await customerRepository.save(customerEntity);
        testContext.testCustomers.set(customer.id, customerEntity);
    }
});

Given('multiple customers exist in the system', async () => {
    // We already have multiple customers from "the system has customers stored" step
});

Given('a customer with the name {string} and date of birth {string} exists', async (name: string, dob: string) => {
    const [firstName, lastName] = name.split(' ');
    const customer = {
        id: uuidv4(),
        firstName,
        lastName,
        dateOfBirth: new Date(dob),
        phoneNumber: '+447911123459',
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        bankAccountNumber: 'GB29NWBK60161331926822',
    };
    const customerEntity = new CustomerEntity();
    Object.assign(customerEntity, customer);
    await customerRepository.save(customerEntity);
    testContext.testCustomers.set(customer.id, customerEntity);
});

Given('a customer with the email {string} exists', async (email: string) => {
    const customer = {
        id: uuidv4(),
        firstName: 'Email',
        lastName: 'Test',
        dateOfBirth: new Date('1990-10-10'),
        phoneNumber: '+447911123460',
        email,
        bankAccountNumber: 'GB29NWBK60161331926823',
    };
    const customerEntity = new CustomerEntity();
    Object.assign(customerEntity, customer);
    await customerRepository.save(customerEntity);
    testContext.testCustomers.set(customer.id, customerEntity);
});