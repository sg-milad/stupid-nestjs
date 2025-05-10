import { GetAllCustomersHandler } from "./get-all-customer.handler";
import { GetCustomerHandler } from "./get-customer.handler";

export * from './get-all-customer.query';
export * from './get-all-customer.handler';

export * from './get-customer.query';
export * from './get-customer.handler';

export const QueryHandlers = [GetCustomerHandler, GetAllCustomersHandler,];
