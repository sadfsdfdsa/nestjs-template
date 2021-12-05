import { Module, CacheModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestModule } from './test/test.module';
import { ConfigModule } from '@nestjs/config';

// import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot(),
    /**
     * @todo Move to env
     */
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.PG_URL,
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        // Connection pool diversity by cluster number
        max: Number(process.env.PG_CONNECTIONS) / Number(process.env.CLUSTER),
      },
    }),
    CacheModule.register({ isGlobal: true }),
    TestModule,
    // ThrottlerModule.forRoot({
    //   ttl: 60,
    //   limit: 10,
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
