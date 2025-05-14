import { CommandHandler, EventPublisher, ICommandHandler } from "@nestjs/cqrs";
import { Inject, NotFoundException } from "@nestjs/common";
import { DeleteCustomerCommand } from "./delete-customer.command";
import { ICustomerRepository } from "../../../domain/customer/repositories/customer.repository.interface";

@CommandHandler(DeleteCustomerCommand)
export class DeleteCustomerHandler implements ICommandHandler<DeleteCustomerCommand> {
    constructor(
        @Inject("ICustomerRepository")
        private readonly customerRepository: ICustomerRepository,
        private readonly eventPublisher: EventPublisher,
    ) { }

    async execute(command: DeleteCustomerCommand): Promise<void> {
        const customer = await this.customerRepository.findById(command.id);
        if (!customer) {
            throw new NotFoundException(`Customer with ID ${command.id} not found`);
        }

        const customerToDelete = this.eventPublisher.mergeObjectContext(customer);
        customerToDelete.delete();

        await this.customerRepository.delete(command.id);

        customerToDelete.commit();
    }
}