import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { Device } from './device.entity';
import { Crop } from '../crops/crop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device, Crop])],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
