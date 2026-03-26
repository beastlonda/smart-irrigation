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

  // ✅ CREATE DEVICE
  async create(createDeviceDto: any): Promise<Device> {
    const crop = await this.cropRepository.findOne({
      where: { id: createDeviceDto.cropId },
    });

    if (!crop) {
      throw new NotFoundException('Crop not found');
    }

    const device = this.deviceRepository.create({
      name: createDeviceDto.name,
      location: createDeviceDto.location,
      crop: crop,
    });

    return this.deviceRepository.save(device);
  }

  // ✅ GET ALL DEVICES
  async findAll(): Promise<Device[]> {
    return this.deviceRepository.find();
  }

  // ✅ GET ONE DEVICE
  async findOne(id: number): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  // ✅ DELETE DEVICE
  async remove(id: number): Promise<void> {
    const result = await this.deviceRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Device not found');
    }
  }
}