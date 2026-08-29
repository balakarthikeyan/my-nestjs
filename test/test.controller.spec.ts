import { Test, TestingModule } from '@nestjs/testing';
import { REQUEST } from '@nestjs/core';
import { UserController } from '../src/user.controller';
import { UserService } from '../src/user.service';
import { Role } from '../src/user.dto';

describe('UserController', () => {
    let controller: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                UserService,
                {
                    provide: REQUEST,
                    useValue: { ip: '127.0.0.1', headers: {} },
                },
            ],
        }).compile();

        controller = await module.resolve<UserController>(UserController);
    });

    it('should return user data', async () => {
        const result = await controller.getUser('1', Role.ADMIN, {});
        expect(result).toHaveProperty('id', '1');
        expect(result).toHaveProperty('role', 'admin');
        expect(result).toHaveProperty('ip', '127.0.0.1');
    });
});