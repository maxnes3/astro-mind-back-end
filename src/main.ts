import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: [process.env.FONTEND_BASE_URL],
    credentials: true,
    exposedHeaders: 'set-cookie'
  });

  const config = new DocumentBuilder()
    .setTitle('AstroMind-Backend')
    .setDescription(
      'The project used: Nest.js + TS + Prisma'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 4200);
}
bootstrap();
