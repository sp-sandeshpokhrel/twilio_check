import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { TwilioService } from './twilio-service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly twilioService: TwilioService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    console.log(
      await this.twilioService.sendSms({
        body: 'Hello from Twilio',
        to: '+9779847536829',
      }),
    );
    return this.appService.getHello();
  }

  @Post()
  async messageStatus(@Req() req: any) {
    console.log(req.body);
    return 'OK';
  }
}
