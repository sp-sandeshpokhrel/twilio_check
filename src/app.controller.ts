import { Body, Controller, Get, Post, Req, Param } from '@nestjs/common';
import { TwilioService } from './utils/twilio-service';
import { CreateMessageDto } from './utils/twilio-service/dto/create-message.dto';
import { ApiCreatedResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { MessageEntity } from './utils/twilio-service/entities/message.entity';

@Controller()
export class AppController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send')
  @ApiCreatedResponse({ type: MessageEntity })
  async create(@Body() message: CreateMessageDto) {
    console.log('FROM GET HELLO');
    console.log(message);
    const mes = this.twilioService.sendSms(message);
    console.log('Done');
    return mes;
  }

  //callback url from twilio which gives us different status of message(delivered, read, failed, sent)
  @Post()
  @ApiExcludeEndpoint()
  async messageStatus(@Req() req: any) {
    console.log('FROM STATUS');
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
