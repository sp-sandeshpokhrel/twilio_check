import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TwilioModule } from './twilio-service';

@Module({
  imports: [
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_SID,
      authToken: process.env.TWILIO_SECRET,
      from: '+14155238886',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
