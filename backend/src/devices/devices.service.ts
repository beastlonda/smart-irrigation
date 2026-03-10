import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { Crop } from '../crops/crop.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,

    @InjectRepository(Crop)
    private cropRepository: Repository<Crop>,
  ) {}

  async create(data: any) {
    const crop = await this.cropRepository.findOne({
      where: { id: data.cropId },
    });

    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    const device = this.deviceRepository.create({
      name: data.name,
      location: data.location,
      mode: data.mode,
      crop: crop,
    });

    return this.deviceRepository.save(device);
  }

  findAll() {
    return this.deviceRepository.find();
  }
}
