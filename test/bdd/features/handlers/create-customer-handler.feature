Feature: Create Customer Command Handler
  As a developer
  I want to ensure the CreateCustomerHandler works correctly
  So that customer creation business logic is properly implemented

  Scenario: Successfully handling a valid customer creation command
    Given I have a valid CreateCustomerCommand
    When I execute the CreateCustomerHandler
    Then a customer ID should be returned
    And the customer should be saved in the repository
    And a CustomerCreatedEvent should be published

  Scenario: Handling a command with duplicate customer details
    Given a customer with the same name and date of birth exists in the repository
    When I execute the CreateCustomerHandler with duplicate details
    Then a conflict exception should be thrown about duplicate customer

  Scenario: Handling a command with duplicate email
    Given a customer with the same email exists in the repository
    When I execute the CreateCustomerHandler with duplicate email
    Then a conflict exception should be thrown about duplicate email