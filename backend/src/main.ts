import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

async function bootstrap() {
  // JWT 密碼強度驗證
  if (process.env.NODE_ENV === 'production') {
    const jwtSecret = process.env.JWT_SECRET;
    const weakSecrets = ['your-secret-key-change-this-in-production'];

    if (!jwtSecret || weakSecrets.includes(jwtSecret) || jwtSecret.length < 32) {
      throw new Error('生產環境必須更換 JWT_SECRET ！');
    }
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', true);

  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  // 是否啟用 CORS
  if (process.env.ENABLE_CORS === 'true') {
    const corsOrigins = process.env.CORS_ORIGINS?.split(',') || '*';
    const isWildcard = corsOrigins === '*' || (Array.isArray(corsOrigins) && corsOrigins.includes('*'));

    app.enableCors({
      origin: isWildcard ? true : corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'], // x-line-userId
    });
  }

  // 全域驗證管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const packageJsonPath = path.resolve(__dirname, '../../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const config = new DocumentBuilder()
    .setTitle('Food Traceability System')
    .setDescription('食材履歷追溯系統')
    .setVersion(`v${packageJson.version}`)
    .addBearerAuth()
    .build();

  const theme = new SwaggerTheme();
  const darkCss = theme.getBuffer(SwaggerThemeNameEnum.DARK);
  const customOptions = {
    customCss: darkCss.toString() + `
    .swagger-ui .title, 
    .swagger-ui .renderedMarkdown p,
    .swagger-ui .nostyle span,
    .swagger-ui .opblock-summary-description,
    .swagger-ui .parameter__type,
    .swagger-ui .model-box *:not(.star):not(.prop-type):not(.primitive) {
      color: #fafafa !important;
    }
    .swagger-ui .model-box .prop-type {
      color: #a3be8c !important;
    }`,
  };
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('apidoc', app, document, customOptions);

  const port = process.env.PORT || 3000; // 對內 port
  const appPort = process.env.APP_PORT || 3000; // 對外 port

  await app.listen(port);

  console.info('');
  console.info('Application is ready');
  console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.info(`API URL:        http://localhost:${appPort}`);
  console.info(`Swagger Docs:   http://localhost:${appPort}/apidoc`);
  console.info(`Version:        v${packageJson.version}`);
  console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.info('');
}

bootstrap();
