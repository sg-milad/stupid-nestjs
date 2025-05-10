import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  public createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME || 'customer_user',
      password: process.env.DB_PASSWORD || 'customer_password',
      database: process.env.DB_DATABASE || 'customer_db',
      entities: [
        join(
          __dirname,
          '..',
          'persistence',
          'entities',
          '*.orm-entity{.ts,.js}',
        ),
      ],
      synchronize: true,
      logging: false,
    };
  }
}
