import { IsEmail, IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'alece@gmail.com', description: 'Email' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsString({ message: 'Email must be a string' })
  readonly email: string

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsString({ message: 'Password must be a string' })
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string
}
