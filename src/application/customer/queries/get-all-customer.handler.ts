import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { CustomerDto } from "./customer.dto";
import { ICustomerRepository } from "src/domain/customer/repositories/customer.repository.interface";
import { GetAllCustomersQuery } from "./get-all-customer.query";

@QueryHandler(GetAllCustomersQuery)
export class GetAllCustomersHandler implements IQueryHandler<GetAllCustomersQuery> {
    constructor(
        @Inject("ICustomerRepository")
        private readonly customerRepository: ICustomerRepository,
    ) { }

    async execute(_query: GetAllCustomersQuery): Promise<CustomerDto[]> {
        const customers = await this.customerRepository.findAll();

        return customers.map(customer => new CustomerDto(
            customer.getId(),
            customer.getFirstName(),
            customer.getLastName(),
            customer.getDateOfBirth(),
            customer.getPhoneNumber().getValue(),
            customer.getEmail().getValue(),
            customer.getBankAccountNumber().getValue(),
        ));
    }
}