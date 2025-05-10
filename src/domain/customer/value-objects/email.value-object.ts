import { BadRequestException } from '@nestjs/common';

export class Email {
    private readonly value: string;

    private constructor(email: string) {
        this.value = email;
    }

    public static create(email: string): Email {
        if (!this.isValidEmail(email)) {
            throw new BadRequestException('Invalid email address');
        }

        return new Email(email.toLowerCase());
    }

    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    public getValue(): string {
        return this.value;
    }

    public equals(email: Email): boolean {
        return this.value === email.getValue();
    }
}