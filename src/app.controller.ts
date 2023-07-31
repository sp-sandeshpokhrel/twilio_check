import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Param,
  NotFoundException,
  Header,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { TwilioService } from './utils/twilio-service';
import { CreateMessageDto } from './utils/twilio-service/dto/create-message.dto';
import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
} from '@nestjs/swagger';
import { MessageEntity } from './utils/twilio-service/entities/message.entity';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send')
  @ApiCreatedResponse({ type: MessageEntity })
  async create(@Body() message: CreateMessageDto) {
    console.log('FROM GET SEND');
    console.log(message);
    const mes = this.twilioService.sendSms(message);
    console.log('Done');
    return mes;
  }

  //callback url from twilio which gives us different status of message(delivered, read, failed, sent)
  @Post()
  @ApiExcludeEndpoint()
  async messageStatus(
    @Headers('X-Twilio-Signature') signature: string,
    @Req() req: Request,
  ) {
    const url = 'https://defiant-visor-crow.cyclic.app/';
    const params = req.body;
    const authToken = process.env.TWILIO_SECRET;
    if (
      !this.twilioService.validateRequest(url, params, signature, authToken)
    ) {
      throw new UnauthorizedException();
    }
    console.log('FROM STATUS');
    console.log(req.body);
    console.log(await this.twilioService.statusUpdate(params));
    return 'OK';
  }

  @Post('queue')
  @ApiOkResponse()
  async queue(@Body() messages: CreateMessageDto[]) {
    await this.twilioService.sendBulkSms(messages);
    return { message: 'OK' };
  }

  @Get(':sid')
  @ApiCreatedResponse({ type: MessageEntity })
  async getMessageStatus(@Param('sid') sid: string) {
    const message = await this.twilioService.getMessageStatus(sid);
    if (!message) {
      throw new NotFoundException();
    }
    return message;
  }
}
