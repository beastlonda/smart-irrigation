import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutoAction } from './auto-action.entity';
import { AutoActionsService } from './auto-actions.service';
import { AutoActionsController } from './auto-actions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AutoAction])],
  providers: [AutoActionsService],
  controllers: [AutoActionsController],
})
export class AutoActionsModule {}
