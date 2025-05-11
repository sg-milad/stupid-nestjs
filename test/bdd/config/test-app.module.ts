// test/bdd/config/test-app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { CustomerModule } from '../../../src/application/customer/customer.module';
import { testTypeOrmConfig } from './test-typeorm.config';

@Module({
    imports: [
        TypeOrmModule.forRoot(testTypeOrmConfig),
        CqrsModule.forRoot(),
        CustomerModule,
    ],
})
export class TestAppModule { }