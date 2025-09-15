import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'oldPassword123' })
  @IsString()
  @MinLength(6)
  actualPassword: string;

  @ApiProperty({ description: 'New password', example: 'newStrongPassword456' })
  @IsString()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ description: 'New password confirmation', example: 'newStrongPassword456' })
  @IsString()
  @MinLength(6)
  confirmPassword: string;
}

