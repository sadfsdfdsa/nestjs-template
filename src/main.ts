import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'fastify-compress';
import { prometheus } from './prometheus/main';
import { runInCluster } from './cluster';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    // { logger: true }
  );

  const config = new DocumentBuilder()
    .setTitle('Test example')
    .setDescription('The test API description')
    .setVersion('1.0')
    .addTag('test')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  app.use(prometheus);

  app.register(compression, { encodings: ['gzip', 'deflate'] });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(app.close);
  }

  await app.listen(8080);
}

runInCluster(bootstrap);
