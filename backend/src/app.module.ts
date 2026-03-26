import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { DevicesModule } from './devices/devices.module';
import { SensorReadingsModule } from './sensor-readings/sensor-readings.module';
import { CropsModule } from './crops/crops.module';
import { AutoActionsModule } from './auto-actions/auto-actions.module';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Database connection
  TypeOrmModule.forRoot({
  type: 'better-sqlite3',
  database: 'smartfarm.db',
  autoLoadEntities: true,
  synchronize: true,
}),

    // Project modules
    DevicesModule,
    SensorReadingsModule,
    CropsModule,
    AutoActionsModule,
  ],
})
export class AppModule {}