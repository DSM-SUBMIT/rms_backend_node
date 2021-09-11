import { IsEnum, IsString } from 'class-validator';

export class ConfirmProjectDto {
  @IsEnum(['approve', 'deny'])
  type: string;

  @IsString()
  comment: string;
}
