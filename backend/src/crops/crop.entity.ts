import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Crop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  minTemp: number;

  @Column('float')
  maxTemp: number;

  @Column('float')
  minPh: number;

  @Column('float')
  maxPh: number;

  @Column('float')
  minMoisture: number;

  @Column('float')
  maxMoisture: number;

  @Column('float')
  minNitrogen: number;

  @Column('float')
  maxNitrogen: number;

  @Column('float')
  minPhosphorus: number;

  @Column('float')
  maxPhosphorus: number;

  @Column('float')
  minPotassium: number;

  @Column('float')
  maxPotassium: number;
}
