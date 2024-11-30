import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum Category {
  GENERAL = 'GENERAL',
  TECHNOLOGY = 'TECHNOLOGY',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
}

export class CreateUpdateTopicDto {
  @IsString()
  @ApiProperty({ example: 'My First Topic' })
  title: string;

  @IsString()
  @ApiProperty({ example: 'This is a detailed description of my topic.' })
  description: string;

  @IsEnum(Category)
  @ApiProperty({ example: Category.GENERAL, enum: Category })
  category: Category;
}

export class QueryTopicsDto {
  @IsOptional()
  @Type(() => Number)
  pageSize?: number;
  @IsOptional()
  @Type(() => Number)
  page?: number;
  @IsOptional()
  orderBy?: 'asc' | 'desc' | 'hot';
  @IsOptional()
  @Type(() => String)
  userId?: string;
}
