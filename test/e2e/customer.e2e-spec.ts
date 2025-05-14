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
            find: jest.fn(), // Add this missing method
            count: jest.fn().mockResolvedValue(0),
            delete: jest.fn(), // Add this missing method
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

    describe('GET /customers', () => {
        it('should return an array of customers', async () => {
            // Fix: Mock the find method properly
            customerRepositoryMock.find.mockResolvedValue([mockCustomer]);

            await request(app.getHttpServer())
                .get('/customers')
                .expect(200)
                .expect(res => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body[0]).toHaveProperty('id', mockCustomer.id);
                });
        });
    });

    describe('PUT /customers/:id', () => {
        it('should update and return the customer', async () => {
            const updateDto = {
                firstName: 'mmad',           // changed
                lastName: 'dooo',            // changed
                dateOfBirth: '1991-01-01',   // changed
                phoneNumber: '+12025550123',
                email: 'mmad.dooo@example.com', // changed
                bankAccountNumber: '12345678901234',
            };

            const updatedCustomer = {
                id: mockCustomer.id,
                firstName: updateDto.firstName,
                lastName: updateDto.lastName,
                dateOfBirth: new Date(updateDto.dateOfBirth),
                phoneNumber: updateDto.phoneNumber,
                email: updateDto.email,
                bankAccountNumber: updateDto.bankAccountNumber,
            };

            // Set up mocks with proper sequencing for the test flow
            let findOneCallCount = 0;

            // Mock findOne to return different results based on call sequence
            customerRepositoryMock.findOne.mockImplementation(() => {
                findOneCallCount++;
                // First call: Check if customer exists (in command handler)
                if (findOneCallCount === 1) {
                    return Promise.resolve(mockCustomer);
                }
                // Second call: Get updated customer (in query handler after update)
                else {
                    return Promise.resolve(updatedCustomer);
                }
            });

            // Mock save operation
            customerRepositoryMock.save.mockImplementation(() => {
                return Promise.resolve(updatedCustomer);
            });

            await request(app.getHttpServer())
                .put(`/customers/${mockCustomer.id}`)
                .send(updateDto)
                .expect(200)
                .expect(res => {
                    expect(res.body).toHaveProperty('id', mockCustomer.id);
                    expect(res.body.firstName).toBe(updateDto.firstName);
                    expect(res.body.email).toBe(updateDto.email);
                });
        });

        it('should return 404 if customer not found', async () => {
            customerRepositoryMock.findOne.mockResolvedValue(null);

            await request(app.getHttpServer())
                .put(`/customers/non-existent-id`)
                .send({
                    firstName: 'X',
                    lastName: 'Y',
                    dateOfBirth: '2000-01-01',
                    phoneNumber: '+10000000000',
                    email: 'x@y.com',
                    bankAccountNumber: '00000000000000',
                })
                .expect(404);
        });
    });

    describe('DELETE /customers/:id', () => {
        it('should delete the customer and return 200', async () => {
            // Fix: Properly mock findOne and delete methods
            customerRepositoryMock.findOne.mockResolvedValue(mockCustomer);
            customerRepositoryMock.delete.mockResolvedValue({ affected: 1 });

            await request(app.getHttpServer())
                .delete(`/customers/${mockCustomer.id}`)
                .expect(200);
        });

        it('should return 404 if customer not found', async () => {
            customerRepositoryMock.findOne.mockResolvedValue(null);

            await request(app.getHttpServer())
                .delete('/customers/non-existent-id')
                .expect(404);
        });
    });
});