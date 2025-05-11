import { When, Then } from '@cucumber/cucumber';
import * as request from 'supertest';
import { expect } from 'chai';
import { testContext } from './common.steps';
import { CustomerEntity } from '../../../src/infrastructure/persistence/entities/customer.orm-entity';

interface CustomerData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    email: string;
    bankAccountNumber: string;
}

When('I create a customer with the following details:', async (dataTable) => {
    const data = dataTable.hashes()[0] as CustomerData;

    try {
        const response = await request(testContext.app!.getHttpServer())
            .post('/customers')
            .send({
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth,
                phoneNumber: data.phoneNumber,
                email: data.email,
                bankAccountNumber: data.bankAccountNumber,
            });

        testContext.currentResponse = response;

        if (response.body && response.body.id) {
            testContext.createdCustomerId = response.body.id;
        }
    } catch (error) {
        testContext.errorResponse = error;
    }
});

Then('the customer should be created successfully', () => {
    expect(testContext.currentResponse.status).to.equal(201);
});

Then('I should receive a customer ID', () => {
    expect(testContext.currentResponse.body).to.have.property('id');
    expect(testContext.currentResponse.body.id).to.be.a('string');
});

Then('the creation should fail with an error message about invalid mobile number', () => {
    expect(testContext.currentResponse.status).to.equal(400);
    expect(testContext.currentResponse.body.message).to.include('Phone number must be a valid mobile number');
});

Then('the creation should fail with an error message about invalid email', () => {
    expect(testContext.currentResponse.status).to.equal(400);
    expect(testContext.currentResponse.body.message).to.include('email');
});

Then('the creation should fail with an error message about duplicate customer', () => {
    expect(testContext.currentResponse.status).to.equal(409);
    expect(testContext.currentResponse.body.message).to.include('Customer already exists');
});

Then('the creation should fail with an error message about duplicate email', () => {
    expect(testContext.currentResponse.status).to.equal(409);
    expect(testContext.currentResponse.body.message).to.include('Email is already in use');
});

Then('the customer should be stored in the database', async () => {
    const id = testContext.createdCustomerId;
    expect(id).to.be.a('string');

    const savedCustomer = await testContext.customerRepository!.findOne({ where: { id } });
    expect(savedCustomer).to.not.be.null;
});