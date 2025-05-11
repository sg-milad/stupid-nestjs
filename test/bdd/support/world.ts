// test/bdd/support/world.ts
import { setWorldConstructor, World } from '@cucumber/cucumber';
import { INestApplication } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../../../src/infrastructure/persistence/entities/customer.orm-entity';

// Define a custom World class to store test context
export class CustomWorld extends World {
    app: INestApplication;
    customerRepository: Repository<CustomerEntity>;
    testCustomers: Map<string, CustomerEntity> = new Map();
    currentResponse: any;
    errorResponse: any;
    createdCustomerId: string;

    constructor(options) {
        super(options);
    }
}

// Set the custom World constructor
setWorldConstructor(CustomWorld);