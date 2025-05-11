# test/bdd/features/customer/delete-customer.feature
Feature: Customer Deletion
  As a system user
  I want to delete customers
  So that their information is removed from the system

  Background:
    Given the system has customers stored

  Scenario: Successfully deleting a customer
    Given a customer with ID exists in the system
    When I delete the customer
    Then the customer should be deleted successfully
    And the customer should no longer exist in the system

  Scenario: Attempting to delete a non-existent customer
    When I delete a customer with ID "non-existent-id"
    Then I should receive a not found error