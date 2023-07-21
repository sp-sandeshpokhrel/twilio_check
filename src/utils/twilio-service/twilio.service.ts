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
  prisma: PrismaClient;

  constructor(options: TwilioServiceOptions, prismaService: PrismaClient) {
    const twilioAccountSid = options.accountSid;
    const twilioAuthToken = options.authToken;
    this.from = options.from;
    this.prisma = prismaService;

    console.log(this.prisma.message.findMany());

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio account SID/auth token not found');
    }

    this.client = require('twilio')(twilioAccountSid, twilioAuthToken);
  }

  async sendSms(options: MessageListInstanceCreateOptions) {
    console.log(await this.prisma.message.findMany());
    const message: MessageInstance = await this.client.messages.create({
      ...options,
      from: `whatsapp:${this.from ? this.from : options.from}`,
      to: `whatsapp:${options.to}`,
    });
    console.log(message);
    console.log('Here');

    return this.prisma.message.create({
      data: { ...message, sid: message.sid, status: 'initiated' },
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
    console.log(this.prisma.message.findUnique({ where: { sid: MessageSid } }));
    return await this.prisma.message.update({
      where: { sid: MessageSid },
      data: { status: MessageStatus },
    });
  }
}
