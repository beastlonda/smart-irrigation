import { Controller, Post, Body, Get } from '@nestjs/common';
import { SensorReadingsService } from './sensor-readings.service';

@Controller('sensor-readings')
export class SensorReadingsController {
  constructor(private readonly sensorService: SensorReadingsService) {}

  @Post()
  create(@Body() body: any) {
    return this.sensorService.create(body);
  }

  @Get()
  findAll() {
    return this.sensorService.findAll();
  }
}
