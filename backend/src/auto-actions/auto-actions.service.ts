import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutoAction } from './auto-action.entity';

@Injectable()
export class AutoActionsService {
  constructor(
    @InjectRepository(AutoAction)
    private autoActionRepo: Repository<AutoAction>,
  ) {}

  findAll() {
    return this.autoActionRepo.find({
      relations: ['sensorReading'],
      order: { createdAt: 'DESC' },
    });
  }
}
