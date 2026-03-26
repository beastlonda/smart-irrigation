import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { AutoActionsService } from './auto-actions.service';

@Controller('auto-actions')
export class AutoActionsController {
  constructor(private autoService: AutoActionsService) {}

  @Post()
  create(@Body() body: { deviceId: number; action: string }) {
    return this.autoService.createAction(body.deviceId, body.action);
  }

  @Get(':deviceId')
  getRecent(@Param('deviceId') deviceId: number) {
    return this.autoService.getRecentActions(deviceId);
  }
}
