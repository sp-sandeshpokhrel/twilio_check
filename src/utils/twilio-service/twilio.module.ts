import { DynamicModule, Module } from '@nestjs/common';
import { TwilioServiceOptions } from './twilio-service-options';
import { TwilioService } from './twilio.service';
import { PrismaClient } from '@prisma/client';

@Module({})
export class TwilioModule {
  static forRoot(
    options: TwilioServiceOptions,
    primsaService: PrismaClient,
  ): DynamicModule {
    const providers = [
      {
        provide: TwilioService,
        useValue: new TwilioService(options, primsaService),
      },
    ];

    return {
      providers: providers,
      exports: providers,
      module: TwilioModule,
    };
  }
}
