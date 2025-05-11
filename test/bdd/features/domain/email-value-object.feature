# test/bdd/features/domain/email-value-object.feature
Feature: Email Value Object
  As a developer
  I want to validate email addresses
  So that only valid emails are stored in the system

  Scenario Outline: Validating email addresses
    When I create an Email value object with "<email>"
    Then the validation should <result>

    Examples:
      | email                | result    |
      | valid@example.com    | succeed   |
      | name.surname@example.com | succeed |
      | name+tag@example.com | succeed   |
      | invalid-email        | fail      |
      | missing@tld          | fail      |
      | @missing-name.com    | fail      |
      | spaces in@email.com  | fail      |
      |                      | fail      |