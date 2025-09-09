import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.enableCors({
    // origin: (origin, callback) => {
    //   const allowedOrigins = [
    //     'http://192.168.72.85',
    //   ];

    //   if (
    //     !origin ||
    //     allowedOrigins.some((o) =>
    //       typeof o === 'string' ? o === origin : o.test(origin),
    //     )
    //   ) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error('Not allowed by CORS'));
    //   }
    // },
    origin: true, // TODO: development only
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Authorization',
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Access-Control-Request-Method',
    ],
  });

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      res.sendStatus(204); // No Content
    } else {
      next();
    }
  });

  await app.listen(process.env.PORT || 3013, '0.0.0.0');
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3013}`,
  );
}
void bootstrap();
