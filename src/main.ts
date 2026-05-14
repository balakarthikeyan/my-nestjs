import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import helmet from 'helmet';
import permissionsPolicy from 'permissions-policy';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security & middleware
  app.use(helmet());
  app.use(compression());
  app.use(bodyParser.json());
  app.use(
    session({
      store: new RedisStore({ client: {} as any }),
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
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
