import { IsOptional, IsString, IsDate, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindArticlesDto {
    @IsOptional()
    @IsString()
    author?: string;
  
    @IsOptional()
    @IsString()
    fromDate?: string;
  
    @IsOptional()
    @IsString()
    toDate?: string;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    chunk?: number;
  }  