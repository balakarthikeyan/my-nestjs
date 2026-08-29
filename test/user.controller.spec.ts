import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../src/user.controller';
import { UserService } from '../src/user.service';
import { Role } from '../src/user.dto';
import { User } from '../src/user.entity';

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService;

    const mockUser: User = {
        id: 1,
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'hashedpassword123',
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockUserService = {
        create: jest.fn().mockResolvedValue(mockUser),
        findAll: jest.fn().mockResolvedValue([mockUser]),
        findOne: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue({ ...mockUser, name: 'Alice Johnson' }),
        remove: jest.fn().mockResolvedValue(undefined),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createUserDto = {
                name: 'Alice Smith',
                email: 'alice@example.com',
                password: 'securepassword123',
                role: Role.ADMIN,
            };

            const result = await controller.create(createUserDto);
            expect(result).toEqual(mockUser);
            expect(userService.create).toHaveBeenCalledWith(createUserDto);
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const result = await controller.findAll();
            expect(result).toEqual([mockUser]);
            expect(userService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single user by ID', async () => {
            const result = await controller.findOne(1);
            expect(result).toEqual(mockUser);
            expect(userService.findOne).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        it('should update and return a user', async () => {
            const updateUserDto = { name: 'Alice Johnson' };
            const result = await controller.update(1, updateUserDto);

            expect(result.name).toEqual('Alice Johnson');
            expect(userService.update).toHaveBeenCalledWith(1, updateUserDto);
        });
    });

    describe('remove', () => {
        it('should call remove on the service', async () => {
            await controller.remove(1);
            expect(userService.remove).toHaveBeenCalledWith(1);
        });
    });
});