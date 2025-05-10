import { Injectable } from '@nestjs/common';
import { PhoneNumberUtil, PhoneNumberType } from 'google-libphonenumber';

@Injectable()
export class PhoneValidatorService {
    private readonly phoneUtil = PhoneNumberUtil.getInstance();

    isValidMobileNumber(phoneNumber: string, countryCode = 'US'): boolean {
        try {
            const parsedNumber = this.phoneUtil.parse(phoneNumber, countryCode);

            if (!this.phoneUtil.isValidNumber(parsedNumber)) {
                return false;
            }

            const numberType = this.phoneUtil.getNumberType(parsedNumber);
            return (
                numberType === PhoneNumberType.MOBILE ||
                numberType === PhoneNumberType.FIXED_LINE_OR_MOBILE
            );
        } catch (error) {
            return false;
        }
    }

    formatToE164(phoneNumber: string, countryCode = 'US'): string {
        try {
            const parsedNumber = this.phoneUtil.parse(phoneNumber, countryCode);
            return this.phoneUtil.format(parsedNumber, 0); // 0 corresponds to E164
        } catch (error) {
            throw new Error(`Invalid phone number: ${error.message}`);
        }
    }
}