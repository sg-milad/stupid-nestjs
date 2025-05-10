export class CustomerDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber: string;
  email: string;
  bankAccountNumber: string;

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    phoneNumber: string,
    email: string,
    bankAccountNumber: string,
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.dateOfBirth = dateOfBirth;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.bankAccountNumber = bankAccountNumber;
  }
}
