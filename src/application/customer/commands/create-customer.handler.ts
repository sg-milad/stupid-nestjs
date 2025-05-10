import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { ConflictException, Inject } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { ICustomerRepository } from "../../../../src/domain/customer/repositories/customer.repository.interface";
import { Email } from "../../../domain/customer/value-objects/email.value-object";
import { PhoneNumber } from "../../../domain/customer/value-objects/phone-number.value-object";
import { CreateCustomerCommand } from "./create-customer.command";
import { Customer } from "../../../domain/customer/entities/customer.entity";
import { BankAccount } from "./../../../domain/customer/value-objects/bank-account.value-object";

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerHandler implements ICommandHandler<CreateCustomerCommand> {
    constructor(
        @Inject("ICustomerRepository")
        private readonly customerRepository: ICustomerRepository,
        private readonly eventPublisher: EventPublisher,
    ) { }

    async execute(command: CreateCustomerCommand): Promise<string> {
        const customerExists = await this.customerRepository.exists(command.firstName, command.lastName, command.dateOfBirth);

        if (customerExists) {
            throw new ConflictException("Customer already exists");
        }

        const emailExists = await this.customerRepository.existsByEmail(command.email);
        if (emailExists) {
            throw new ConflictException("Email is already in use");
        }

        const phoneNumber = PhoneNumber.create(command.phoneNumber);
        const email = Email.create(command.email);
        const bankAccountNumber = BankAccount.create(command.bankAccountNumber);

        const id = uuidv4();

        const customer = this.eventPublisher.mergeObjectContext(
            Customer.create(id, command.firstName, command.lastName, command.dateOfBirth, phoneNumber, email, bankAccountNumber),
        );

        await this.customerRepository.save(customer);

        customer.commit();

        return id;
    }
}
