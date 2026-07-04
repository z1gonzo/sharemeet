import { INestApplication, ValidationPipe } from '@nestjs/common';

function getCorsOrigins() {
  const localOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];
  const configuredOrigins = [process.env.FRONTEND_URL, process.env.CORS_ORIGINS]
    .filter(Boolean)
    .flatMap((value) => value!.split(','))
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...localOrigins, ...configuredOrigins];
}

export function configureApp(app: INestApplication) {
  app.enableCors({
    origin: getCorsOrigins(),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
