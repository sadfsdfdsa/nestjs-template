import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './test.entity';
import { TestController } from './test.controller';
import { TestService } from './test.service';

@Module({
  imports: [TypeOrmModule.forFeature([Test]), CacheModule.register()],
  providers: [TestService],
  controllers: [TestController],
  exports: [],
})
export class TestModule {}
