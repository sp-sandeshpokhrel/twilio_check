// src/articles/entities/article.entity.ts

import { ApiProperty } from '@nestjs/swagger';

export class MessageEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  sid: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  status: string;
}
