Feature: Customer Creation
  As a system user
  I want to create new customers
  So that their information is stored in the system

  Background:
    Given the system is ready to accept customer data

  Scenario: Successfully creating a new customer
    When I create a customer with the following details:
      | firstName   | lastName | dateOfBirth  | phoneNumber    | email                | bankAccountNumber    |
      | John        | Doe      | 1990-01-01   | +447911123456  | john.doe@example.com | GB29NWBK60161331926819 |
    Then the customer should be created successfully
    And I should receive a customer ID

  Scenario: Attempting to create a customer with an invalid mobile number
    When I create a customer with the following details:
      | firstName   | lastName | dateOfBirth  | phoneNumber    | email                | bankAccountNumber    |
      | Jane        | Smith    | 1992-05-15   | 12345          | jane.smith@example.com | GB29NWBK60161331926820 |
    Then the creation should fail with an error message about invalid mobile number

  Scenario: Attempting to create a customer with an invalid email
    When I create a customer with the following details:
      | firstName   | lastName | dateOfBirth  | phoneNumber    | email                | bankAccountNumber    |
      | Alice       | Johnson  | 1985-10-22   | +447911123457  | invalid-email        | GB29NWBK60161331926821 |
    Then the creation should fail with an error message about invalid email

  Scenario: Attempting to create a duplicate customer
    Given a customer with the name "Mark Wilson" and date of birth "1980-03-30" exists
    When I create a customer with the following details:
      | firstName   | lastName | dateOfBirth  | phoneNumber    | email                | bankAccountNumber    |
      | Mark        | Wilson   | 1980-03-30   | +447911123458  | mark.new@example.com | GB29NWBK60161331926822 |
    Then the creation should fail with an error message about duplicate customer

  Scenario: Attempting to create a customer with an email that is already in use
    Given a customer with the email "existing@example.com" exists
    When I create a customer with the following details:
      | firstName   | lastName | dateOfBirth  | phoneNumber    | email                | bankAccountNumber    |
      | Different   | Person   | 1975-12-25   | +447911123459  | existing@example.com | GB29NWBK60161331926823 |
    Then the creation should fail with an error message about duplicate email