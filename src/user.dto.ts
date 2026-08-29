import { IsEnum, IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

export class CreateUserDto {
    @ApiProperty({ example: 'Alice', description: 'User name' })
    @IsString()
    name!: string;

    @ApiProperty({ example: 'alice@example.com', description: 'Unique user email' })
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'password123', description: 'Minimum 6 characters' })
    @IsString()
    @MinLength(6)
    password!: string;

    @ApiProperty({ enum: Role, example: Role.USER, default: Role.USER, description: 'Role of the user' })
    @IsEnum(Role)
    @IsOptional()
    role?: Role = Role.USER;
}

export class UpdateUserDto extends PartialType(CreateUserDto) { }

export class UserResponseDto {
    @ApiProperty({ example: 1 })
    id!: number;

    @ApiProperty({ example: 'Alice' })
    name!: string;

    @ApiProperty({ example: 'alice@example.com' })
    email!: string;

    @ApiProperty({ enum: Role, example: Role.USER })
    role!: Role;

    @ApiProperty({ example: '127.0.0.1' })
    ip?: string;
}