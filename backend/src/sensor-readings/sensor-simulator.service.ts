import { Injectable, OnModuleInit } from '@nestjs/common';
import { SensorReadingsService } from './sensor-readings.service';

@Injectable()
export class SensorSimulatorService implements OnModuleInit {
  constructor(
    private readonly sensorReadingsService: SensorReadingsService,
  ) {}

  onModuleInit() {
    console.log('🚜 Sensor Simulator Running...');

    setInterval(async () => {
      const reading = {
        deviceId: 2,

        temperature: Math.floor(Math.random() * 70) + 10,
        humidity: Math.floor(Math.random() * 100),
        ph: parseFloat((Math.random() * 8).toFixed(1)),
        soilMoisture: Math.floor(Math.random() * 60),
        nitrogen: Math.floor(Math.random() * 150),
        phosphorus: Math.floor(Math.random() * 100),
        potassium: Math.floor(Math.random() * 100),
      };

      console.log('🌱 New Reading Generated');

      await this.sensorReadingsService.create(reading);
    }, 5000);
  }
}
