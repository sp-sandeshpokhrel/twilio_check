import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import TwilioClient from 'twilio/lib/rest/Twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaService } from './prisma/prisma.service';

@Processor('message')
export class MessageConsumer {
  private readonly logger = new Logger(MessageConsumer.name);
  private client: TwilioClient;
  private prisma: PrismaService;

  @Process()
  async message(job: Job) {
    this.client = require('twilio')(
      process.env.TWILIO_SID,
      process.env.TWILIO_SECRET,
    );
    this.prisma = new PrismaService();
    const option: CreateMessageDto = job.data.option;
    try {
      const message = await this.sendSms(option);
      this.logger.log(`Message sent to ${option.to} with sid ${message.sid}`);
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }

  private async sendSms(option: CreateMessageDto) {
    const message: MessageInstance = await this.client.messages.create({
      ...option,
      from: `whatsapp:${option.from}`,
      to: `whatsapp:${option.to}`,
    });

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
}
