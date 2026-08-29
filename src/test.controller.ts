import {
    Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus,
    ValidationPipe, UsePipes, Query, Headers, Ip, UseGuards, Injectable, CanActivate, ExecutionContext
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeaders, ApiProperty } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserService } from './user.service';
import { Role, CreateUserDto, UpdateUserDto, UserResponseDto } from './user.dto';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.headers['authorization'] === 'Bearer secret-token';
    }
}

@ApiTags('test')
@Controller('test')
@UseGuards(AuthGuard)
export class TestController {
    constructor(private readonly userService: UserService) { }

    // In this example, we demonstrate how to use various decorators and validation in a NestJS controller method. 
    // The `getUser` method retrieves a user by ID, validates the input, and formats the client's IP address. 
    // It also includes Swagger documentation for better API understanding.
    @Get(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    @ApiBearerAuth()
    @ApiHeaders([{ name: 'x-custom-header', description: 'Custom header' }])
    async getUser(
        @Param('id', ParseIntPipe) id: number,
        @Query('role') role: Role,
        @Headers() headers: Record<string, string>,
        @Ip() ip: string,
    ) {
        const formattedIp = this.userService.formatClientIp(ip);
        const dto = plainToInstance(CreateUserDto, { name: 'Demo', role });
        const errors = await validate(dto);
        if (errors.length > 0) {
            // throw new BadRequestException('Validation failed');
            return { error: 'Validation failed', details: errors };
        }
        return {
            id,
            role,
            headers,
            ip: formattedIp,
        };
    }
}