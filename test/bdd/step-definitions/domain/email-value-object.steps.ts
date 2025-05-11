// test/bdd/step-definitions/domain/email-value-object.steps.ts
import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { Email } from '../../../../src/domain/customer/value-objects/email.value-object';

// Context for sharing state between steps
const context: {
    email: Email;
    error: Error;
} = {
    email: null,
    error: null,
};

When('I create an Email value object with {string}', (email: string) => {
    try {
        context.email = Email.create(email);
        context.error = null;
    } catch (error) {
        context.email = null;
        context.error = error;
    }
});

Then('the validation should succeed', () => {
    expect(context.email).to.not.be.null;
    expect(context.error).to.be.null;
    expect(context.email.getValue()).to.be.a('string');
});

Then('the validation should fail', () => {
    expect(context.email).to.be.null;
    expect(context.error).to.not.be.null;
    expect(context.error.message).to.include('invalid');
});