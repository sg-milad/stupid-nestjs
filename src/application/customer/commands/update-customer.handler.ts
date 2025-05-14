import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { ConflictException, Inject, NotFoundException } from "@nestjs/common";
import { UpdateCustomerCommand } from "./update-customer.command";
import { ICustomerRepository } from "../../../domain/customer/repositories/customer.repository.interface";
import { PhoneNumber } from "../../../domain/customer/value-objects/phone-number.value-object";
import { Email } from "../../../domain/customer/value-objects/email.value-object";
import { BankAccount } from "../../../domain/customer/value-objects/bank-account.value-object";

@CommandHandler(UpdateCustomerCommand)
export class UpdateCustomerHandler implements ICommandHandler<UpdateCustomerCommand> {
    constructor(
        @Inject("ICustomerRepository")
        private readonly customerRepository: ICustomerRepository,
        private readonly eventPublisher: EventPublisher,
    ) { }

    async execute(command: UpdateCustomerCommand): Promise<void> {
        const customer = await this.customerRepository.findById(command.id);
        if (!customer) {
            throw new NotFoundException(`Customer with ID ${command.id} not found`);
        }

        if (customer.getEmail().getValue() !== command.email) {
            const emailExists = await this.customerRepository.existsByEmail(command.email);
            if (emailExists) {
                throw new ConflictException("Email is already in use");
            }
        }

        const existingCustomer = await this.customerRepository.findByIdentity(
            command.firstName,
            command.lastName,
            command.dateOfBirth,
        );

        if (existingCustomer && existingCustomer.getId() !== command.id) {
            throw new ConflictException("Another customer with the same identity already exists");
        }

        const phoneNumber = PhoneNumber.create(command.phoneNumber);
        const email = Email.create(command.email);
        const bankAccountNumber = BankAccount.create(command.bankAccountNumber);

        const updatedCustomer = this.eventPublisher.mergeObjectContext(customer);
        updatedCustomer.update(
            command.firstName,
            command.lastName,
            command.dateOfBirth,
            phoneNumber,
            email,
            bankAccountNumber,
        );

        await this.customerRepository.update(updatedCustomer);

        updatedCustomer.commit();
    }
}