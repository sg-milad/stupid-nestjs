import { After, AfterAll, Before, BeforeAll } from '@cucumber/cucumber';
import { testContext } from '../step-definitions/common.steps';

BeforeAll(async () => {
    // Global setup before all tests if needed
    console.log('Starting BDD test suite...');
});

AfterAll(async () => {
    // Global teardown after all tests
    console.log('Completed BDD test suite.');

    // Close the application if it exists
    if (testContext.app) {
        await testContext.app.close();
    }
});

After(async () => {
    // Clean up after each scenario
    if (testContext.customerRepository) {
        // Clear the database between scenarios
        await testContext.customerRepository.clear();
    }
});