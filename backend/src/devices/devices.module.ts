import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Crop } from '../crops/crop.entity';   // ✅ IMPORTANT

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, Crop]),  // ✅ FIX HERE
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}