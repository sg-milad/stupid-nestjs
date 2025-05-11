// test/bdd/step-definitions/delete-customer.steps.ts
import { When, Then } from '@cucumber/cucumber';
import * as request from 'supertest';
import { expect } from 'chai';
import { testContext } from './common.steps';

When('I delete the customer', async () => {
    try {
        const id = testContext.createdCustomerId;
        const response = await request(testContext.app!.getHttpServer())
            .delete(`/customers/${id}`);

        testContext.currentResponse = response;
    } catch (error) {
        testContext.errorResponse = error;
    }
});

When('I delete a customer with ID {string}', async (id: string) => {
    try {
        const response = await request(testContext.app!.getHttpServer())
            .delete(`/customers/${id}`);

        testContext.currentResponse = response;
    } catch (error) {
        testContext.errorResponse = error;
    }
});

Then('the customer should be deleted successfully', () => {
    expect(testContext.currentResponse.status).to.equal(204);
});

Then('the customer should no longer exist in the system', async () => {
    const id = testContext.createdCustomerId;

    // Try to find the customer in the database
    const customer = await testContext.customerRepository!.findOne({ where: { id } });
    expect(customer).to.be.null;

    // Try to get the customer via API
    const response = await request(testContext.app!.getHttpServer())
        .get(`/customers/${id}`);

    expect(response.status).to.equal(404);
});