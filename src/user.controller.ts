import {
    Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus,
    UseGuards, Injectable, CanActivate, ExecutionContext
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './user.dto';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.headers['authorization'] === 'Bearer secret-token';
    }
}

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, type: UserResponseDto })
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, type: [UserResponseDto] })
    async findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({ status: 204, description: 'User deleted successfully' })
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
}