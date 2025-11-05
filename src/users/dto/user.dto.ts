import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEnum(['admin', 'user'])
  @IsNotEmpty()
  role: 'admin' | 'user';

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsNumber()
  @IsOptional()
  androidTimes?: number;

  @IsNumber()
  @IsOptional()
  iosTimes?: number;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user';

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsNumber()
  @IsOptional()
  androidTimes?: number;

  @IsNumber()
  @IsOptional()
  iosTimes?: number;

  @IsString()
  @IsOptional()
  avatar?: string;
}
