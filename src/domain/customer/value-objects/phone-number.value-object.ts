import { BadRequestException } from '@nestjs/common';
import { PhoneNumberUtil, PhoneNumberType } from 'google-libphonenumber';

export class PhoneNumber {
    private readonly value: string;
    private static readonly phoneUtil = PhoneNumberUtil.getInstance();

    private constructor(phoneNumber: string) {
        this.value = phoneNumber;
    }

    public static create(phoneNumber: string, countryCode = 'US'): PhoneNumber {
        try {
            const parsedNumber = this.phoneUtil.parse(phoneNumber, countryCode);

            if (!this.phoneUtil.isValidNumber(parsedNumber)) {
                throw new BadRequestException('Invalid phone number');
            }

            const numberType = this.phoneUtil.getNumberType(parsedNumber);
            if (
                numberType !== PhoneNumberType.MOBILE &&
                numberType !== PhoneNumberType.FIXED_LINE_OR_MOBILE
            ) {
                throw new BadRequestException('Phone number must be a mobile number');
            }

            const e164Format = this.phoneUtil.format(parsedNumber, 0); // 0 corresponds to E164

            return new PhoneNumber(e164Format);
        } catch (error) {
            throw new BadRequestException(`Invalid phone number: ${error.message}`);
        }
    }

    public getValue(): string {
        return this.value;
    }

    public equals(phoneNumber: PhoneNumber): boolean {
        return this.value === phoneNumber.getValue();
    }
}