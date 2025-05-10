import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches, IsDateString } from "class-validator";

export class UpdateCustomerRequestDto {
    @ApiProperty({
        description: 'First name of customer',
        example: 'John'
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'Last name of customer',
        example: 'Doe'
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        description: 'Date of birth in YYYY-MM-DD format',
        example: '1990-01-01'
    })
    @IsDateString()
    dateOfBirth: string;

    @ApiProperty({
        description: 'Phone number',
        example: '+447123456789'
    })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({
        description: 'Email address',
        example: 'john.doe@example.com'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Bank account number',
        example: '12345678'
    })
    @IsString()
    @IsNotEmpty()
    // Add validation pattern based on your bank account number format requirements
    @Matches(/^\d{8,}$/, { message: 'Bank account number must contain at least 8 digits' })
    bankAccountNumber: string;
}