import { DynamicModule, Module } from '@nestjs/common';
import { TwilioServiceOptions } from './twilio-service-options';
import { TwilioService } from './twilio.service';
import { PrismaService } from './prisma.service';

@Module({})
export class TwilioModule {
  static forRoot(options: TwilioServiceOptions): DynamicModule {
    const providers = [
      {
        provide: TwilioService,
        useValue: new TwilioService(options, new PrismaService()),
      },
      PrismaService,
    ];

    return {
      providers: providers,
      exports: providers,
      module: TwilioModule,
    };
  }
}
