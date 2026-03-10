import { Controller, Get, Post, Body } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  create(@Body() body: any) {
    return this.devicesService.create(body);
  }

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }
}
