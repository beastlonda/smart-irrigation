import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Device } from '../devices/device.entity';

@Entity()
export class SensorReading {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Device, (device) => device.readings, {
    onDelete: 'CASCADE',
  })
  device: Device;

  @Column('float')
  temperature: number;

  @Column('float')
  humidity: number;

  @Column('float')
  ph: number;

  @Column('float')
  soilMoisture: number;

  @Column('float')
  nitrogen: number;

  @Column('float')
  phosphorus: number;

  @Column('float')
  potassium: number;

  @Column()
  status: string;

  @Column('simple-array', { nullable: true })
  alerts: string[];

  @Column('simple-array', { nullable: true })
  recommendations: string[];

  @CreateDateColumn()
  createdAt: Date;
}
