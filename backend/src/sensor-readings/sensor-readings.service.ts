import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorReading } from './sensor-reading.entity';
import { Device } from '../devices/device.entity';
import { AutoAction } from '../auto-actions/auto-action.entity';

@Injectable()
export class SensorReadingsService {
  constructor(
    @InjectRepository(SensorReading)
    private sensorRepo: Repository<SensorReading>,

    @InjectRepository(Device)
    private deviceRepo: Repository<Device>,

    @InjectRepository(AutoAction)
    private autoActionRepo: Repository<AutoAction>,
  ) {}

  async create(data: any) {
    const device = await this.deviceRepo.findOne({
      where: { id: data.deviceId },
      relations: ['crop'],
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const crop = device.crop;

    let status = 'GOOD';
    const alerts: string[] = [];
    const recommendations: string[] = [];

    if (data.temperature > crop.maxTemp) {
      alerts.push('Temperature too high');
      recommendations.push('Activate cooling system');
    }

    if (data.ph < crop.minPh) {
      alerts.push('Soil pH too low');
      recommendations.push('Add lime to increase pH');
    }

    if (data.soilMoisture < crop.minMoisture) {
      alerts.push('Soil moisture too low');
      recommendations.push('Start irrigation pump');
    }

    if (data.nitrogen < crop.minNitrogen) {
      alerts.push('Nitrogen level too low');
      recommendations.push('Add nitrogen fertilizer');
    }

    if (data.phosphorus < crop.minPhosphorus) {
      alerts.push('Phosphorus level too low');
      recommendations.push('Add phosphorus fertilizer');
    }

    if (data.potassium < crop.minPotassium) {
      alerts.push('Potassium level too low');
      recommendations.push('Add potassium fertilizer');
    }

    if (alerts.length > 0) {
      status = 'CRITICAL';
    }

    const reading = this.sensorRepo.create({
      temperature: data.temperature,
      humidity: data.humidity,
      ph: data.ph,
      soilMoisture: data.soilMoisture,
      nitrogen: data.nitrogen,
      phosphorus: data.phosphorus,
      potassium: data.potassium,
      device: device,
      status: status,
      alerts: alerts,
      recommendations: recommendations,
    });

    const savedReading = await this.sensorRepo.save(reading);

    // 🔥 AUTO MODE LOGIC
    if (device.mode === 'AUTO' && status === 'CRITICAL') {
      for (const rec of recommendations) {
        const autoAction = this.autoActionRepo.create({
          sensorReading: savedReading,
          actionType: 'AUTO_TRIGGER',
          message: rec,
          executed: true,
        });

        await this.autoActionRepo.save(autoAction);
      }
    }

    return savedReading;
  }

  findAll() {
    return this.sensorRepo.find({
      relations: ['device'],
    });
  }
}
