## Description

Nestjs Util for twilio whatsapp messaging. Can be run as standalone application or can be used as a module in any nestjs application.

## Installation

```bash
$  yarn  install
```

## Running the app

Run Postgresql database instance and redis instance in docker container using docker-compose.yml file in the root directory using:

```bash
docker-compose up -d
```

Set the enviroment variable by creating a .env file in the root directory and add the variable as mentioned in .env.example file.

For twilio env variable, you can get the values from twilio console.

And set status callback url in twilio console as http://domain/status or wherever your hosted application is.

### For running as Standalone

```bash
# development
$  yarn  run  start
# watch mode
$  yarn  run  start:dev
# production mode
$  yarn  run  start:prod
```

### For running as module

Install following module

```bash
yarn add @nestjs/bull bull prisma twilio
```

Run

```bash
$ npx prisma init
```

Make following schema in schema.prisma in prisma dir in root dir

```typescript
model  Message{
	id  Int  @id  @default(autoincrement())
	sid  String  @unique
	body  String
	to  String
	from  String
	status  String
}
```

Then run

```bash
$ npx prisma migrate dev --name init
```

Copy the src/utils/twilio-service folder in your nestjs application src/utils/ and import the TwilioModule in your app.module.ts file.

```typescript
import { TwilioModule } from './utils/twilio-service';
```

And in app.module imports

```typescript
imports: [
  TwilioModule.forRoot({
    accountSid: process.env.TWILIO_SID,
    authToken: process.env.TWILIO_SECRET,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  }),
];
```

And in app.controller, you need to implement the following routes:

For sending single message route, The message format can be inferred from CreateMessageDto in dto directory inside twilio-service:

```typescript
@Post('send')
@ApiCreatedResponse({ type: MessageEntity })
async create(@Body() message: CreateMessageDto) {
	//your custom logic
	const mes = this.twilioService.sendSms(message);
	return mes;
}
```

For status callback from twilio, you need to implement the following route:

```typescript
//callback url from twilio which gives us different status of message(delivered, read, failed, sent)
@Post('status')
@ApiExcludeEndpoint()
async messageStatus(
@Headers('X-Twilio-Signature') signature: string,
@Req() req: Request,
) {
	const url = '';//your status callback set in twilio console
	const params = req.body;
	const authToken = process.env.TWILIO_SECRET;
	if (!this.twilioService.validateRequest(url, params, signature, authToken))
	{
		throw new UnauthorizedException();
	}
	//your custom logic
	await this.twilioService.statusUpdate(params);
	return 'OK';
}
```

For sending bulk messages, you need to implement the following route:

```typescript
@Post('queue')
@ApiOkResponse()
async queue(@Body() messages: CreateMessageDto[]) {
	//your custom logic
	await this.twilioService.sendBulkSms(messages);
	return { message: 'OK' };
}
```

For getting message status, you need to implement the following route:

```typescript
@Get(':sid')
@ApiCreatedResponse({ type: MessageEntity })
async getMessageStatus(@Param('sid') sid: string) {
	const message = await this.twilioService.getMessageStatus(sid);
	if (!message) {
		throw new NotFoundException();
	}
	//your custom logic
	return message;
}
```

## License

Nest is [MIT licensed](LICENSE).
