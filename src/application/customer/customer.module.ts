import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from '../../infrastructure/persistence/entities/customer.orm-entity';
import { CustomerRepository } from '../../infrastructure/persistence/repositories/customer.repository';
import { CustomerController } from '../../presentation/controllers/customer.controller';
import { ValidationModule } from '../../infrastructure/validation/validation.module';
import { CommandHandlers } from './commands/create-customer';
import { QueryHandlers } from './queries/get-customer';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([CustomerEntity]),
    ValidationModule,
  ],
  controllers: [CustomerController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: 'ICustomerRepository',
      useClass: CustomerRepository,
    },
  ],
})
export class CustomerModule {}
