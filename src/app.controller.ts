import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { TwilioService } from './utils/twilio-service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly twilioService: TwilioService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    console.log('FROM GET HELLO');
    await this.twilioService.sendSms({
      body: 'Hello from Twilio',
      to: '+9779847536829',
    });
    console.log('Done');
    return this.appService.getHello();
  }

  @Post()
  async messageStatus(@Req() req: any) {
    console.log('FROM STATU');
    console.log(req.body);
    console.log(await this.twilioService.statusUpdate(req.body));
    return 'OK';
  }
}
