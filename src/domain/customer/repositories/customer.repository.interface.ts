import { Customer } from '../entities/customer.entity';

export interface ICustomerRepository {
  save(customer: Customer): Promise<void>;
  findById(id: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findByIdentity(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
  ): Promise<Customer | null>;
  exists(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
  ): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}
