import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
    ADMIN = 'admin',
    USER = 'user',
}

export class UserDto {
    @ApiProperty({ example: 'Alice', description: 'The name of the user' })
    @IsString()
    name: string;

    @ApiProperty({ enum: Role, example: Role.ADMIN, description: 'Role of the user' })
    @IsEnum(Role)
    role: Role;
}