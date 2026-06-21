import { IsString, IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { ReviewType } from '@prisma/client';

export class CreateReviewDto {
  @IsString()
  projectId: string;

  @IsEnum(ReviewType)
  type: ReviewType;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  fileIds: string[];
}
