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
import bodyParser from 'body-parser';
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
  const redisClient = createClient({ url: 'redis://localhost:6379' });
  redisClient.connect().catch(console.error);

  // Security & middleware
  app.use(helmet());
  app.use(compression());
  app.use(bodyParser.json());
  app.use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
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
    }),
  );

  // Pass real client to RedisStore
  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // 🔥 Swagger setup 
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
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({ example: 'Alice', description: 'The user’s name' })
  @Column()
  name!: string;
}
```

---

## `src/user.dto.ts`
```ts
import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export class UserDto {
  @ApiProperty({ example: 'Alice', description: 'The name of the user' })
  @IsString()
  name!: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN, description: 'Role of the user' })
  @IsEnum(Role)
  role!: Role;
}
```

---

## `src/user.service.ts`
```ts
import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

@Injectable()
export class UserService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getIp(): string | undefined {
    return this.request.ip;
  }
}
```

---

## `src/user.controller.ts`
```ts
import {
    Controller, Get, Param, Query, Headers,
    ValidationPipe, UsePipes, UseGuards, Injectable, CanActivate, ExecutionContext
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeaders, ApiProperty } from '@nestjs/swagger';
import { UserDto, Role } from './user.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserService } from './user.service';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        return request.headers['authorization'] === 'secret-token';
    }
}

class UserResponse {
    @ApiProperty({ example: '1' })
    id!: string;

    @ApiProperty({ example: 'Alice' })
    name!: string;

    @ApiProperty({ example: Role.ADMIN })
    role!: Role;

    @ApiProperty({ example: '127.0.0.1' })
    ip?: string;
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
    async getUser(
        @Param('id') id: string,
        @Query('role') role: Role,
        @Headers() headers: Record<string, any>
    ) {
        const dto = plainToInstance(UserDto, { name: 'Demo', role });
        const errors = await validate(dto);
        if (errors.length > 0) {
            return { error: 'Validation failed', details: errors };
        }
        return { id, role, headers, ip: this.userService.getIp() };
    }
}
```

---

## `test/user.controller.spec.ts`
```ts
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
