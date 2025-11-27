import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaService } from './prisma.service';
import { ValidationService } from './validation.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import { StaticTokenGuard } from './guards/static.token.guard';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/app.log',
          level: process.env.LOG_LEVEL || 'info',
          tailable: true,
        }),
      ],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    S3Service,
    { provide: APP_FILTER, useClass: ErrorFilter },
    { provide: APP_GUARD, useClass: StaticTokenGuard }, // global static token guard
  ],
  exports: [PrismaService, ValidationService, S3Service, WinstonModule],
})
export class CommonModule {}
