//import twilio from 'twilio';
import { Injectable } from '@nestjs/common';
import {
  MessageInstance,
  MessageListInstanceCreateOptions,
} from 'twilio/lib/rest/api/v2010/account/message';
import TwilioClient from 'twilio/lib/rest/Twilio';
import { TwilioServiceOptions } from './twilio-service-options';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class TwilioService {
  client: TwilioClient;
  from: string;

  constructor(
    options: TwilioServiceOptions,
    private prismaService: PrismaClient,
  ) {
    const twilioAccountSid = options.accountSid;
    const twilioAuthToken = options.authToken;
    this.from = options.from;

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio account SID/auth token not found');
    }

    this.client = require('twilio')(twilioAccountSid, twilioAuthToken);
  }

  async sendSms(options: MessageListInstanceCreateOptions) {
    const message: MessageInstance = await this.client.messages.create({
      ...options,
      from: `whatsapp:${this.from ? this.from : options.from}`,
      to: `whatsapp:${options.to}`,
    });
    console.log(message);

    return await this.prismaService.message.create({
      data: { ...message, status: 'initiated' },
    });
  }

  async bulkSendSms(options: MessageListInstanceCreateOptions[]) {
    const promises = options.map((option) => this.sendSms(option));
    return Promise.all(promises);
  }

  async statusUpdate(message: any) {
    console.log('FROM STATUS');
    console.log(message);
    const { MessageSid, MessageStatus } = message;
    return await this.prismaService.message.update({
      where: { sid: MessageSid },
      data: { status: MessageStatus },
    });
  }
}
