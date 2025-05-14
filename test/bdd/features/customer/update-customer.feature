Feature: Customer Update
  As a system user
  I want to update customer information
  So that their details are up to date

  Background:
    Given the system has customers stored

  Scenario: Successfully updating a customer
    Given a customer with ID exists in the system
    When I update the customer with the following details:
      | firstName   | lastName | dateOfBirth  | phoneNumber    | email                | bankAccountNumber    |
      | Updated     | Name     | 1991-02-02   | +447911123460  | updated@example.com  | GB29NWBK60161331926824 |
    Then the customer should be updated successfully
    And the customer details should be updated in the system

  Scenario: Attempting to update a customer with invalid mobile number
    Given a customer with ID exists in the system
    When I update the customer with the following details:
      | firstName   | lastName | dateOfBirth  | phoneNumber    | email                | bankAccountNumber    |
      | Updated     | Name     | 1991-02-02   | 12345          | updated@example.com  | GB29NWBK60161331926824 |
    Then the update should fail with an error message about invalid mobile number

  Scenario: Attempting to update a customer with an email that is already in use
    Given a customer with email "unique@example.com" exists
    And another customer with different ID exists
    When I update the second customer with email "unique@example.com"
    Then the update should fail with an error message about duplicate email