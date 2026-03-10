import { Test, TestingModule } from '@nestjs/testing';
import { SensorReadingsService } from './sensor-readings.service';

describe('SensorReadingsService', () => {
  let service: SensorReadingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SensorReadingsService],
    }).compile();

    service = module.get<SensorReadingsService>(SensorReadingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
