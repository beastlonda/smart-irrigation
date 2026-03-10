import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { SensorReading } from '../sensor-readings/sensor-reading.entity';

@Entity()
export class AutoAction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SensorReading, { onDelete: 'CASCADE' })
  sensorReading: SensorReading;

  @Column()
  actionType: string;

  @Column()
  message: string;

  @Column({ default: true })
  executed: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
