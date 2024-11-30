import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateUpdateCommentDto {
  @IsString()
  @ApiProperty({ example: 'Comment on topic' })
  content: string;

  @IsNumber()
  @ApiProperty({ example: 'Comment on topic' })
  topicId: number;
}
