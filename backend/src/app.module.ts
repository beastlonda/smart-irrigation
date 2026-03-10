import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DevicesModule } from './devices/devices.module';
import { CropsModule } from './crops/crops.module';
import { SensorReadingsModule } from './sensor-readings/sensor-readings.module';
import { AutoActionsModule } from './auto-actions/auto-actions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true,
    }),

    DevicesModule,
    CropsModule,
    SensorReadingsModule,
    AutoActionsModule,
  ],
})
export class AppModule {}