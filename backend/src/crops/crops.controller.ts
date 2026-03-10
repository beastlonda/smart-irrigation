import { Controller, Post, Body, Get } from '@nestjs/common';
import { CropsService } from './crops.service';

@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Post()
  create(@Body() body: any) {
    return this.cropsService.create(body);
  }

  @Get()
  findAll() {
    return this.cropsService.findAll();
  }
}
