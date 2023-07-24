//import twilio from 'twilio';
import { Injectable, Logger } from '@nestjs/common';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import TwilioClient from 'twilio/lib/rest/Twilio';
import { TwilioServiceOptions } from './twilio-service-options';
import { PrismaService } from './prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class TwilioService {
  client: TwilioClient;
  private logger: Logger;

  constructor(options: TwilioServiceOptions, private prisma: PrismaService) {
    this.logger = new Logger('TwilioService');
    this.logger.log('TwilioService Initialized');
    const twilioAccountSid = options.accountSid;
    const twilioAuthToken = options.authToken;

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio account SID/auth token not found');
    }

    this.client = require('twilio')(twilioAccountSid, twilioAuthToken);
  }

  async sendSms(options: CreateMessageDto) {
    const message: MessageInstance = await this.client.messages.create({
      ...options,
      from: `whatsapp:${options.from}`,
      to: `whatsapp:${options.to}`,
    });
    this.logger.log(`Message sent to ${options.to}`);

    return await this.prisma.message.create({
      data: {
        body: options.body,
        to: options.to,
        from: options.from,
        sid: message.sid,
        status: 'initiated',
      },
    });
  }

  async bulkSendSms(options: CreateMessageDto[]) {
    const promises = options.map((option) => this.sendSms(option));
    return Promise.all(promises);
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
