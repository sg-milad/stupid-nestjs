import { BadRequestException } from '@nestjs/common';

export class BankAccount {
  private readonly value: string;

  private constructor(bankAccountNumber: string) {
    this.value = bankAccountNumber;
  }

  public static create(bankAccountNumber: string): BankAccount {
    if (!this.isValidBankAccount(bankAccountNumber)) {
      throw new BadRequestException('Invalid bank account number');
    }

    return new BankAccount(bankAccountNumber);
  }

  private static isValidBankAccount(bankAccountNumber: string): boolean {
    const cleanedNumber = bankAccountNumber.replace(/\s|-/g, '');
    const bankAccountRegex = /^\d{8,34}$/; // Between 8 and 34 digits (IBAN can be up to 34 characters)
    return bankAccountRegex.test(cleanedNumber);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(bankAccount: BankAccount): boolean {
    return this.value === bankAccount.getValue();
  }
}
