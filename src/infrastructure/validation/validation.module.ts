import { Module } from "@nestjs/common";
import { PhoneValidatorService } from "./phone-validator.service";

@Module({
    providers: [PhoneValidatorService],
    exports: [PhoneValidatorService],
})
export class ValidationModule {}
