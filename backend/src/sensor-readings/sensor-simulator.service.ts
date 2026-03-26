import { Injectable, OnModuleInit } from '@nestjs/common';
import { SensorReadingsService } from './sensor-readings.service';

@Injectable()
export class SensorSimulatorService implements OnModuleInit {
  constructor(
    private readonly sensorReadingsService: SensorReadingsService,
  ) {}

  onModuleInit() {
  console.log('🚜 Simulator OFF for setup');
}
}