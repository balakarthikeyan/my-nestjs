import {
    Controller, Get, Param, Query, Headers,
    ValidationPipe, UsePipes, UseGuards, Injectable, CanActivate, ExecutionContext
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeaders, ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserService } from './user.service';

@Injectable()
class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.headers['authorization'] === 'secret-token';
    }
}

class UserResponse {
    @ApiProperty({ example: 'Alice' })
    name: string;
}

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get(':id')
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, type: UserResponse })
    @ApiBearerAuth()
    @ApiHeaders([{ name: 'x-custom-header', description: 'Custom header' }])
    async getUser(@Param('id') id: string, @Query('role') role: string, @Headers() headers: any) {
        const dto = plainToInstance(UserDto, { name: 'Demo', role });
        const errors = await validate(dto);
        if (errors.length > 0) {
            return { error: 'Validation failed', details: errors };
        }
        return { id, role, headers, ip: this.userService.getIp() };
    }
}