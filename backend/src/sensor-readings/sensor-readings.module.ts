import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SensorReading } from './sensor-reading.entity';
import { SensorReadingsService } from './sensor-readings.service';
import { SensorReadingsController } from './sensor-readings.controller';
import { SensorSimulatorService } from './sensor-simulator.service';

import { Device } from '../devices/device.entity';
import { AutoAction } from '../auto-actions/auto-action.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SensorReading,
      Device,       // ✅ ADD THIS
      AutoAction,   // ✅ ADD THIS
    ]),
  ],
  controllers: [SensorReadingsController],
  providers: [
    SensorReadingsService,
    SensorSimulatorService,
  ],
})
export class SensorReadingsModule {}
