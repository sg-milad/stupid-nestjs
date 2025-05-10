import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomerEntity } from '../../src/infrastructure/persistence/entities/customer.orm-entity';

describe('CustomerController (e2e)', () => {
    let app: INestApplication;
    let customerRepositoryMock: any;

    const mockCustomer = {
        id: 'test-uuid',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('1990-01-01'),
        phoneNumber: '+12025550123',
        email: 'john.doe@example.com',
        bankAccountNumber: '12345678901234',
    };

    beforeAll(async () => {
        customerRepositoryMock = {
            save: jest.fn(),
            findOne: jest.fn(),
            count: jest.fn().mockResolvedValue(0),
            createQueryBuilder: jest.fn(() => ({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getCount: jest.fn().mockResolvedValue(0)
            })),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(getRepositoryToken(CustomerEntity))
            .useValue(customerRepositoryMock)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/customers (POST)', () => {
        it('should create a new customer', async () => {

            const createCustomerDto = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                phoneNumber: '+12025550123',
                email: 'john.doe@example.com',
                bankAccountNumber: '12345638901234',
            };
            customerRepositoryMock.save.mockResolvedValue(createCustomerDto);

            // Act & Assert
            return request(app.getHttpServer())
                .post('/customers')
                .send(createCustomerDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id');
                });
        });

        it('should return 400 if request data is invalid', async () => {
            // Arrange
            const invalidCreateCustomerDto = {
                firstName: '', // Invalid: empty
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                phoneNumber: '+12025550123',
                email: 'invalid-email', // Invalid: not an email
                bankAccountNumber: '12345678901234',
            };

            // Act & Assert
            return request(app.getHttpServer())
                .post('/customers')
                .send(invalidCreateCustomerDto)
                .expect(400);
        });
    });

    describe('/customers/:id (GET)', () => {
        it('should return a customer by id', async () => {
            // Arrange
            const customerId = 'test-uuid';
            customerRepositoryMock.findOne.mockResolvedValue(mockCustomer);

            // Act & Assert
            return request(app.getHttpServer())
                .get(`/customers/${customerId}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toHaveProperty('id', customerId);
                    expect(res.body).toHaveProperty('firstName', mockCustomer.firstName);
                    expect(res.body).toHaveProperty('lastName', mockCustomer.lastName);
                    expect(res.body).toHaveProperty('email', mockCustomer.email);
                });
        });

        it('should return 404 if customer not found', async () => {
            // Arrange
            const nonExistentId = 'non-existent-id';
            customerRepositoryMock.findOne.mockResolvedValue(null);

            // Act & Assert
            return request(app.getHttpServer())
                .get(`/customers/${nonExistentId}`)
                .expect(404);
        });
    });
});