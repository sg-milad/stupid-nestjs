import { AggregateRoot } from "@nestjs/cqrs";
import { CustomerCreatedEvent } from "../events/customer-created.event";
import { PhoneNumber } from "../value-objects/phone-number.value-object";
import { Email } from "../value-objects/email.value-object";
import { BankAccount } from "../value-objects/bank-account.value-object";
import { CustomerUpdatedEvent } from "../events/customer-update.event";
import { CustomerDeletedEvent } from "../events/delete-customer.event";

export class Customer extends AggregateRoot {
    private readonly id: string;
    private firstName: string;
    private lastName: string;
    private dateOfBirth: Date;
    private phoneNumber: PhoneNumber;
    private email: Email;
    private bankAccountNumber: BankAccount;

    constructor(
        id: string,
        firstName: string,
        lastName: string,
        dateOfBirth: Date,
        phoneNumber: PhoneNumber,
        email: Email,
        bankAccountNumber: BankAccount,
    ) {
        super();
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.bankAccountNumber = bankAccountNumber;
    }

    public static create(
        id: string,
        firstName: string,
        lastName: string,
        dateOfBirth: Date,
        phoneNumber: PhoneNumber,
        email: Email,
        bankAccountNumber: BankAccount,
    ): Customer {
        const customer = new Customer(id, firstName, lastName, dateOfBirth, phoneNumber, email, bankAccountNumber);

        customer.apply(
            new CustomerCreatedEvent(
                id,
                firstName,
                lastName,
                dateOfBirth,
                phoneNumber.getValue(),
                email.getValue(),
                bankAccountNumber.getValue(),
            ),
        );

        return customer;
    }

    public update(
        firstName: string,
        lastName: string,
        dateOfBirth: Date,
        phoneNumber: PhoneNumber,
        email: Email,
        bankAccountNumber: BankAccount,
    ): void {
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.bankAccountNumber = bankAccountNumber;

        this.apply(
            new CustomerUpdatedEvent(
                this.id,
                firstName,
                lastName,
                dateOfBirth,
                phoneNumber.getValue(),
                email.getValue(),
                bankAccountNumber.getValue(),
            ),
        );
    }

    public delete(): void {
        this.apply(new CustomerDeletedEvent(this.id));
    }

    public getId(): string {
        return this.id;
    }

    public getFirstName(): string {
        return this.firstName;
    }

    public getLastName(): string {
        return this.lastName;
    }

    public getDateOfBirth(): Date {
        return this.dateOfBirth;
    }

    public getPhoneNumber(): PhoneNumber {
        return this.phoneNumber;
    }

    public getEmail(): Email {
        return this.email;
    }

    public getBankAccountNumber(): BankAccount {
        return this.bankAccountNumber;
    }
}
