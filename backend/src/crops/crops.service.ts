import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Crop } from './crop.entity';

@Injectable()
export class CropsService {
  constructor(
    @InjectRepository(Crop)
    private cropRepo: Repository<Crop>,
  ) {}

  create(data: Partial<Crop>) {
    const crop = this.cropRepo.create(data);
    return this.cropRepo.save(crop);
  }

  findAll() {
    return this.cropRepo.find();
  }
}
