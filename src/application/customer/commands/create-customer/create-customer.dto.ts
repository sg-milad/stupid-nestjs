export class CreateCustomerDto {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly dateOfBirth: Date;
    readonly phoneNumber: string;
    readonly email: string;
    readonly bankAccountNumber: string;
}