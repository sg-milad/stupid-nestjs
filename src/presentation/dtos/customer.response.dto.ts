import { ApiProperty } from "@nestjs/swagger";

export class CustomerResponseDto {
    @ApiProperty({
        description: "Customer unique identifier",
        example: "550e8400-e29b-41d4-a716-446655440000",
    })
    id: string;

    @ApiProperty({
        description: "Customer first name",
        example: "John",
    })
    firstName: string;

    @ApiProperty({
        description: "Customer last name",
        example: "Doe",
    })
    lastName: string;

    @ApiProperty({
        description: "Customer date of birth",
        example: "1990-01-01",
    })
    dateOfBirth: string;

    @ApiProperty({
        description: "Mobile phone number in E.164 format",
        example: "+12025550123",
    })
    phoneNumber: string;

    @ApiProperty({
        description: "Email address",
        example: "john.doe@example.com",
    })
    email: string;

    @ApiProperty({
        description: "Bank account number",
        example: "12345678901234",
    })
    bankAccountNumber: string;
}
