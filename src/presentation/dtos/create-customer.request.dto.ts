import { IsEmail, IsNotEmpty, IsString, IsDateString, MaxLength, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCustomerRequestDto {
    @ApiProperty({
        description: "Customer first name",
        example: "John",
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    firstName: string;

    @ApiProperty({
        description: "Customer last name",
        example: "Doe",
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    lastName: string;

    @ApiProperty({
        description: "Customer date of birth in ISO format (YYYY-MM-DD)",
        example: "1990-01-01",
    })
    @IsNotEmpty()
    @IsDateString()
    dateOfBirth: string;

    @ApiProperty({
        description: "Mobile phone number with country code",
        example: "+12025550123",
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(20)
    phoneNumber: string;

    @ApiProperty({
        description: "Email address",
        example: "john.doe@example.com",
    })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({
        description: "Bank account number",
        example: "12345678901234",
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    bankAccountNumber: string;
}
