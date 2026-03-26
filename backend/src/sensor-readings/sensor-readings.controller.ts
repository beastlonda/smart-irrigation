import { Controller, Get, Post, Body } from '@nestjs/common';
import { SensorReadingsService } from './sensor-readings.service';

@Controller('sensor-readings')
export class SensorReadingsController {
  constructor(private readonly sensorService: SensorReadingsService) {}

  // ✅ POST (ESP32 will hit this)
  @Post()
  create(@Body() body: any) {
    return this.sensorService.create(body);
  }

  // ✅ GET (for frontend)
  @Get()
  findAll() {
    return this.sensorService.findAll();
  }
}