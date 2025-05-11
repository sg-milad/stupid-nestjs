// test/bdd/config/test-typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CustomerEntity } from '../../../src/infrastructure/persistence/entities/customer.orm-entity';

export const testTypeOrmConfig: TypeOrmModuleOptions = {
    type: 'sqlite',
    database: ':memory:',
    entities: [CustomerEntity],
    synchronize: true,
    logging: false,
};