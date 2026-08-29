# 📂 Project Structure
```
nestjs-demo/
  package.json
  tsconfig.json
  src/
    main.ts
    app.module.ts
    user.entity.ts
    user.dto.ts
    user.service.ts
    user.controller.ts
  test/
    user.controller.spec.ts
```

---

## `package.json`
```json
{
  "name": "nestjs",
  "version": "1.0.0",
  "description": "NestJS demo project with Swagger, TypeORM, validation, guards, and middleware",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0", 
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.3.1",
    "@nestjs/typeorm": "^10.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "compression": "^1.7.4",
    "connect-redis": "^7.0.0", 
    "express-session": "^1.17.3",
    "helmet": "^7.0.0",
    "lodash": "^4.17.21",
    "permissions-policy": "^0.3.0",
    "redis": "^4.6.7",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "swagger-ui-express": "^5.0.1",
    "typeorm": "^0.3.17",
    "sqlite3": "^5.1.7"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@eslint/js": "^9.18.0",
    "@nestjs/cli": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^5.0.0",
    "@types/jest": "^30.0.0",
    "@types/node": "^24.0.0",
    "@types/supertest": "^7.0.0",
    "eslint": "^9.18.0",
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2",
    "globals": "^17.0.0",
    "jest": "^30.0.0",
    "prettier": "^3.4.2",
    "source-map-support": "^0.5.21",
    "supertest": "^7.0.0",
    "ts-jest": "^29.2.5",
    "ts-loader": "^9.5.2",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.7.3",
    "typescript-eslint": "^8.20.0"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

---

## `tsconfig.json`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

---

## `src/main.ts`
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
// import bodyParser from 'body-parser';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import helmet from 'helmet';
import permissionsPolicy from 'permissions-policy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true, // Enabled by default
  });

  // Initialize Redis Client
  const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  redisClient.connect().catch(console.error);

  // Security & Middleware
  app.use(helmet());
  app.use(compression());
  // app.use(bodyParser.json());
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'keyboard cat',
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' },
    }),
  );
  app.use(
    permissionsPolicy({
      features: {
        fullscreen: ['self'],
        camera: ['none'],
        geolocation: ['none'],
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('NestJS Demo API')
    .setDescription('API documentation for demo project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableVersioning({ type: VersioningType.URI });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}/api`);
}
bootstrap();
```

---

## `src/app.module.ts`
```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'test.db',
      entities: [User],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule {}
```

---

## `src/user.entity.ts`
```ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './user.dto';

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Unique identifier' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Alice', description: 'User full name' })
  @Column()
  name!: string;

  @ApiProperty({ example: 'balakarthikeyanexample.com', description: 'Unique user email' })
  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; // Omitted from ApiProperty so it won't leak in Swagger docs

  @ApiProperty({ enum: Role, example: Role.USER, description: 'User permissions role' })
  @Column({ type: 'text', default: Role.USER })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
```

---

## `src/user.dto.ts`
```ts
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

  @ApiProperty({ example: 'balakarthikeyanexample.com', description: 'Unique user email' })
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

  @ApiProperty({ example: 'balakarthikeyanexample.com' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role!: Role;

  @ApiProperty({ example: '127.0.0.1' })
  ip?: string;
}
```

---

## `src/user.service.ts`
```ts
import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class UserService {
  // Example for REQUEST injection
  // constructor(@Inject(REQUEST) private readonly request: Request) { }

  // getIp(): string | undefined {
  //   return this.request.ip;
  // }

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOneBy({ email: createUserDto.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  formatClientIp(ip: string): string {
    return ip === '::1' ? '127.0.0.1' : ip;
  }
}
```

---

## `src/user.controller.ts`
```ts
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

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard)
export class UserController {
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
```

---

## `test/user.controller.spec.ts`
```ts
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
    name: 'Balakarthikeyan',
    email: 'balakarthikeyanexample.com',
    password: 'hashedpassword123',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserService = {
    create: jest.fn().mockResolvedValue(mockUser),
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ ...mockUser, name: 'Balakarthikeyan' }),
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
        name: 'Balakarthikeyan',
        email: 'balakarthikeyanexample.com',
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
      const updateUserDto = { name: 'Balakarthikeyan' };
      const result = await controller.update(1, updateUserDto);

      expect(result.name).toEqual('Balakarthikeyan');
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
```

---

## 🚀 Running the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm run start:dev
   ```
3. Open Swagger UI:
   ```
   http://localhost:3000/api
   ```

---

This package is now **complete**: middleware, guards, DTOs, Swagger docs, Type
