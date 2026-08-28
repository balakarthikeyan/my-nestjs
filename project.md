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
  "name": "nestjs-demo",
  "version": "1.0.0",
  "description": "NestJS demo project with Swagger, TypeORM, validation, guards, and middleware",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "test": "jest"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "compression": "^1.7.4",
    "connect-redis": "^7.0.0",
    "express-session": "^1.17.3",
    "helmet": "^7.0.0",
    "lodash": "^4.17.21",
    "permissions-policy": "^0.3.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "swagger-ui-express": "^4.7.0",
    "typeorm": "^0.3.17"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.0.0"
  }
}
```

---

## `tsconfig.json`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "es2017",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "strict": true
  }
}
```

---

## `src/main.ts`
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import helmet from 'helmet';
import * as permissionsPolicy from 'permissions-policy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(compression());
  app.use(bodyParser.json());
  app.use(
    session({
      store: new RedisStore({ client: {} as any }), // mock client for demo
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: false,
    }),
  );
  app.use(
    permissionsPolicy({
      features: {
        camera: ['none'],
        geolocation: ['none'],
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS Demo API')
    .setDescription('API documentation for demo project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableVersioning({ type: 'uri' });
  await app.listen(3000);
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
  id: number;

  @ApiProperty({ example: 'Alice', description: 'The user’s name' })
  @Column()
  name: string;
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
  name: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN, description: 'Role of the user' })
  @IsEnum(Role)
  role: Role;
}
```

---

## `src/user.service.ts`
```ts
import { Injectable, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getIp(): string {
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
  constructor(private readonly userService: UserService) {}

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
```

---

## `test/user.controller.spec.ts`
```ts
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
