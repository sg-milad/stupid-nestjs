import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetCustomerQuery } from './get-customer.query';
import { CustomerDto } from './customer.dto';
import { ICustomerRepository } from '../../../../domain/customer/repositories/customer.repository.interface';

@QueryHandler(GetCustomerQuery)
export class GetCustomerHandler implements IQueryHandler<GetCustomerQuery> {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(query: GetCustomerQuery): Promise<CustomerDto> {
    const customer = await this.customerRepository.findById(query.id);

    if (!customer) {
      throw new NotFoundException(`Customer with id ${query.id} not found`);
    }

    return new CustomerDto(
      customer.getId(),
      customer.getFirstName(),
      customer.getLastName(),
      customer.getDateOfBirth(),
      customer.getPhoneNumber().getValue(),
      customer.getEmail().getValue(),
      customer.getBankAccountNumber().getValue(),
    );
  }
}
