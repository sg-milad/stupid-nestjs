Feature: Customer Retrieval
  As a system user
  I want to retrieve customer information
  So that I can view their details

  Background:
    Given the system has customers stored

  Scenario: Successfully retrieving a customer by ID
    Given a customer with ID exists in the system
    When I request the customer by their ID
    Then I should receive the customer details

  Scenario: Attempting to retrieve a non-existent customer
    When I request a customer with ID "non-existent-id"
    Then I should receive a not found error

  Scenario: Retrieving all customers
    Given multiple customers exist in the system
    When I request all customers
    Then I should receive a list of all customers