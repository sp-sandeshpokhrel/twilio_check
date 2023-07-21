import { Body, Controller, Get, Post, Req, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { TwilioService } from './utils/twilio-service';
import { CreateMessageDto } from './utils/twilio-service/dto/create-message.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { MessageEntity } from './utils/twilio-service/entities/message.entity';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly twilioService: TwilioService,
  ) {}

  @Post('send')
  @ApiCreatedResponse({ type: MessageEntity })
  async create(@Body() message: CreateMessageDto) {
    console.log('FROM GET HELLO');
    const mes = await this.twilioService.sendSms(message);
    console.log('Done');
    return mes;
  }

  @Post()
  async messageStatus(@Req() req: any) {
    console.log('FROM STATU');
    console.log(req.body);
    console.log(await this.twilioService.statusUpdate(req.body));
    return 'OK';
  }

  @Get(':sid')
  @ApiCreatedResponse({ type: MessageEntity })
  async getMessageStatus(@Param('sid') sid: string) {
    return this.twilioService.getMessageStatus(sid);
  }
}
