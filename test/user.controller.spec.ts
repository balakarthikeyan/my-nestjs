import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../src/user.controller';
import { UserService } from '../src/user.service';

describe('UserController', () => {
    let controller: UserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [UserService],
        }).compile();

        controller = module.get<UserController>(UserController);
    });

    it('should return user data', async () => {
        const result = await controller.getUser('1', 'admin', {});
        expect(result).toHaveProperty('id', '1');
        expect(result).toHaveProperty('role', 'admin');
    });
});
