import { ConfigModuleOptions } from '@nestjs/config';
import appConfig from './app.config';
// import databaseConfig from "./database.config";

export function ConfigModuleOptions(): ConfigModuleOptions {
  const options: ConfigModuleOptions = {};
  options.isGlobal = true;
  options.cache = true;
  options.load = [appConfig];
  options.envFilePath = `.env.${process.env.NODE_ENV}`;
  return options;
}
