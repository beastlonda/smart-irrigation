import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

import { SensorReading } from '../sensor-readings/sensor-reading.entity';
import { Crop } from '../crops/crop.entity';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ default: 'AUTO' })
  mode: string;

  // 🔗 Device belongs to one crop
  @ManyToOne(() => Crop, { eager: true })
  crop: Crop;

  // 🔗 Device has many sensor readings
  @OneToMany(() => SensorReading, (reading) => reading.device)
  readings: SensorReading[];
}
