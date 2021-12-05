import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from './test.entity';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private readonly repository: Repository<Test>,
  ) {}

  async findAll(): Promise<Test[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<Test | undefined> {
    return this.repository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async generateRandom(): Promise<void> {
    const test = new Test();
    test.text = 'asd';

    await this.repository.save(test);
  }
}
