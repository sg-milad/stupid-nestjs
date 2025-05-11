// test/bdd/step-definitions/get-customer.steps.ts
import { When, Then } from '@cucumber/cucumber';
import * as request from 'supertest';
import { expect } from 'chai';
import { testContext } from './common.steps';

When('I request the customer by their ID', async () => {
    try {
        const id = testContext.createdCustomerId;
        const response = await request(testContext.app!.getHttpServer())
            .get(`/customers/${id}`);

        testContext.currentResponse = response;
    } catch (error) {
        testContext.errorResponse = error;
    }
});

When('I request a customer with ID {string}', async (id: string) => {
    try {
        const response = await request(testContext.app!.getHttpServer())
            .get(`/customers/${id}`);

        testContext.currentResponse = response;
    } catch (error) {
        testContext.errorResponse = error;
    }
});

When('I request all customers', async () => {
    try {
        const response = await request(testContext.app!.getHttpServer())
            .get('/customers');

        testContext.currentResponse = response;
    } catch (error) {
        testContext.errorResponse = error;
    }
});

Then('I should receive the customer details', () => {
    expect(testContext.currentResponse.status).to.equal(200);

    const customer = testContext.currentResponse.body;
    expect(customer).to.have.property('id');
    expect(customer).to.have.property('firstName');
    expect(customer).to.have.property('lastName');
    expect(customer).to.have.property('dateOfBirth');
    expect(customer).to.have.property('phoneNumber');
    expect(customer).to.have.property('email');
    expect(customer).to.have.property('bankAccountNumber');

    // Verify the ID matches
    expect(customer.id).to.equal(testContext.createdCustomerId);
});

Then('I should receive a not found error', () => {
    expect(testContext.currentResponse.status).to.equal(404);
});

Then('I should receive a list of all customers', () => {
    expect(testContext.currentResponse.status).to.equal(200);

    const customers = testContext.currentResponse.body;
    expect(customers).to.be.an('array');
    expect(customers.length).to.be.at.least(2); // We created at least 2 customers

    // Check that each customer has the required properties
    customers.forEach(customer => {
        expect(customer).to.have.property('id');
        expect(customer).to.have.property('firstName');
        expect(customer).to.have.property('lastName');
        expect(customer).to.have.property('dateOfBirth');
        expect(customer).to.have.property('phoneNumber');
        expect(customer).to.have.property('email');
        expect(customer).to.have.property('bankAccountNumber');
    });
});