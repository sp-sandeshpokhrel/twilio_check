//import twilio from 'twilio';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import TwilioClient from 'twilio/lib/rest/Twilio';
import { TwilioServiceOptions } from './twilio-service-options';
import { PrismaService } from './prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectQueue } from '@nestjs/bull';

import { Queue } from 'bull';

@Injectable()
export class TwilioService {
  private client: TwilioClient;
  private logger: Logger;

  constructor(
    @Inject('CONFIG_OPTIONS') private options: TwilioServiceOptions,
    private prisma: PrismaService,
    @InjectQueue('message') private readonly messageQueue: Queue,
  ) {
    this.logger = new Logger('TwilioService');
    this.logger.log('TwilioService Initialized');
    const twilioAccountSid = options.accountSid;
    const twilioAuthToken = options.authToken;

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio account SID/auth token not found');
    }

    this.client = require('twilio')(twilioAccountSid, twilioAuthToken);
  }

  validateRequest(
    url: string,
    params: any,
    signature: string,
    authToken: string,
  ) {
    const client = require('twilio');
    return client.validateRequest(authToken, signature, url, params);
  }

  async sendSms(option: CreateMessageDto) {
    const message: MessageInstance = await this.client.messages.create({
      ...option,
      from: `whatsapp:${option.from}`,
      to: `whatsapp:${option.to}`,
    });
    this.logger.log(`Message sent to ${option.to}`);
    return await this.prisma.message.create({
      data: {
        body: option.body,
        to: option.to,
        from: option.from,
        sid: message.sid,
        status: message.status,
      },
    });
  }

  async sendBulkSms(options: CreateMessageDto[]) {
    this.logger.log('Sending bulk sms');
    options.map(async (option) => {
      await this.messageQueue.add(
        {
          option: option,
        },
        {
          delay: 1500,
          attempts: 3,
        },
      );
    });
    return 'Sending';
  }

  async statusUpdate(message: any) {
    const { MessageSid, MessageStatus } = message;
    this.logger.log(
      `Message with SID:${MessageSid} status updated to ${MessageStatus}`,
    );
    return await this.prisma.message.update({
      where: { sid: MessageSid },
      data: { status: MessageStatus },
    });
  }

  async getMessageStatus(sid: string) {
    return await this.prisma.message.findUnique({ where: { sid } });
  }
}
