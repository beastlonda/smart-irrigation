import { Controller, Get } from '@nestjs/common';
import { AutoActionsService } from './auto-actions.service';

@Controller('auto-actions')
export class AutoActionsController {
  constructor(private readonly autoActionsService: AutoActionsService) {}

  @Get()
  findAll() {
    return this.autoActionsService.findAll();
  }
}
