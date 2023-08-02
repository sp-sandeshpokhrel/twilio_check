import { DynamicModule, Module } from '@nestjs/common';
import { TwilioServiceOptions } from './twilio-service-options';
import { TwilioService } from './twilio.service';
import { PrismaService } from './prisma/prisma.service';
import { BullModule } from '@nestjs/bull';
import { MessageConsumer } from './message.consumer';

@Module({})
export class TwilioModule {
  static forRoot(options: TwilioServiceOptions): DynamicModule {
    const providers = [
      {
        provide: 'CONFIG_OPTIONS',
        useValue: options,
      },
      PrismaService,
      TwilioService,
      MessageConsumer,
    ];

    const imports = [
      BullModule.forRoot({
        redis: {
          host: options.host,
          port: options.port,
        },
      }),
      BullModule.registerQueue({
        name: 'message',
      }),
    ];

    return {
      imports: imports,
      providers: providers,
      exports: providers,
      module: TwilioModule,
    };
  }
}
