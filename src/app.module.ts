import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TwilioModule } from './utils/twilio-service';

@Module({
  imports: [
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_SID,
      authToken: process.env.TWILIO_SECRET,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
