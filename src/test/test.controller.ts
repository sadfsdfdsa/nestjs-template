import {
  CacheInterceptor,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Test } from './test.entity';
import { TestService } from './test.service';

@ApiTags('Test')
@Controller('test')
@UseInterceptors(CacheInterceptor)
export class TestController {
  constructor(private readonly service: TestService) {}

  @Get()
  findAll(): Promise<Test[]> {
    return this.service.findAll();
  }

  @Get('/create')
  generateRandom(): Promise<void> {
    return this.service.generateRandom();
  }

  @ApiResponse({
    status: 200,
    description: 'The record has been successfully created.',
    type: Test,
  })
  @ApiResponse({ status: 404, description: 'Forbidden.' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Test> {
    const item = await this.service.findOne(id);
    if (!item) throw new HttpException('Forbidden', HttpStatus.NOT_FOUND);
    return item;
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
