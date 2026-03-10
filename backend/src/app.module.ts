import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DevicesModule } from './devices/devices.module';
import { SensorReadingsModule } from './sensor-readings/sensor-readings.module';
import { CropsModule } from './crops/crops.module';
import { AutoActionsModule } from './auto-actions/auto-actions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'smartfarm',
      password: 'smartfarm123',
      database: 'smartfarm_db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    DevicesModule,
    SensorReadingsModule,
    CropsModule,
    AutoActionsModule,
  ],
})
export class AppModule {}
