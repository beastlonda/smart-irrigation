import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutoAction } from './auto-action.entity';

@Injectable()
export class AutoActionsService {
  constructor(
    @InjectRepository(AutoAction)
    private autoRepo: Repository<AutoAction>,
  ) {}

  async createAction(deviceId: number, action: string) {
    return this.autoRepo.save({
      deviceId: deviceId,
      action: action,
      createdAt: new Date(),
    });
  }

  async getRecentActions(deviceId: number) {
    return this.autoRepo.find({
      where: {
        deviceId: deviceId,
      },
      order: {
        createdAt: 'DESC',
      },
      take: 5,
    });
  }
}