import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ValidationModule } from "./infrastructure/validation/validation.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "./infrastructure/config/typeorm.config.service";
import { ConfigModuleOptions } from "./infrastructure/config/config.module.options";
import { CustomerModule } from "./application/customer/customer.module";

@Module({
    imports: [
        ConfigModule.forRoot(ConfigModuleOptions()),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useClass: TypeOrmConfigService,
        }),
        CustomerModule,
        ValidationModule,
    ],
})
export class AppModule { }
