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
