import { When, Then } from '@cucumber/cucumber';
import * as request from 'supertest';
import { expect } from 'chai';
import { testContext } from './common.steps';

interface CustomerUpdateData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phoneNumber: string;
    email: string;
    bankAccountNumber: string;
}

When('I update the customer with the following details:', async (dataTable) => {
    try {
        const data = dataTable.hashes()[0] as CustomerUpdateData;
        const id = testContext.createdCustomerId;

        const response = await request(testContext.app!.getHttpServer())
            .put(`/customers/${id}`)
            .send({
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth,
                phoneNumber: data.phoneNumber,
                email: data.email,
                bankAccountNumber: data.bankAccountNumber,
            });

        testContext.currentResponse = response;
    } catch (error) {
        testContext.errorResponse = error;
    }
});

When('I update the second customer with email {string}', async (email: string) => {
    try {
        // Get the second customer from the test customers
        const customers = Array.from(testContext.testCustomers.values());
        const secondCustomer = customers[1];

        const response = await request(testContext.app!.getHttpServer())
            .put(`/customers/${secondCustomer.id}`)
            .send({
                firstName: secondCustomer.firstName,
                lastName: secondCustomer.lastName,
                dateOfBirth: secondCustomer.dateOfBirth,
                phoneNumber: secondCustomer.phoneNumber,
                email: email, // Use the provided email
                bankAccountNumber: secondCustomer.bankAccountNumber,
            });

        testContext.currentResponse = response;
    } catch (error) {
        testContext.errorResponse = error;
    }
});

Then('the customer should be updated successfully', () => {
    expect(testContext.currentResponse.status).to.equal(200);
});

Then('the customer details should be updated in the system', async () => {
    const id = testContext.createdCustomerId;

    // Get the updated customer from the database
    const updatedCustomer = await testContext.customerRepository!.findOne({ where: { id } });
    expect(updatedCustomer).to.not.be.null;

    // Check that the response contains the updated data
    const responseCustomer = testContext.currentResponse.body;
    expect(responseCustomer.firstName).to.equal(updatedCustomer!.firstName);
    expect(responseCustomer.lastName).to.equal(updatedCustomer!.lastName);
    expect(new Date(responseCustomer.dateOfBirth).toISOString().split('T')[0])
        .to.equal(updatedCustomer!.dateOfBirth.toISOString().split('T')[0]);
    expect(responseCustomer.phoneNumber).to.equal(updatedCustomer!.phoneNumber);
    expect(responseCustomer.email).to.equal(updatedCustomer!.email);
    expect(responseCustomer.bankAccountNumber).to.equal(updatedCustomer!.bankAccountNumber);
});

Then('the update should fail with an error message about invalid mobile number', () => {
    expect(testContext.currentResponse.status).to.equal(400);
    expect(testContext.currentResponse.body.message).to.include('Phone number must be a valid mobile number');
});

Then('the update should fail with an error message about duplicate email', () => {
    expect(testContext.currentResponse.status).to.equal(409);
    expect(testContext.currentResponse.body.message).to.include('Email is already in use');
});