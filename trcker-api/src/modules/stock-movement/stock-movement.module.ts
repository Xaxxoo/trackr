import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementsController } from './stock-movements.controller';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementsRepository } from './stock-movements.repository';
import { StockMovement, StockTransfer, StockAdjustment, StockReservation } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([StockMovement, StockTransfer, StockAdjustment, StockReservation])],
  controllers: [StockMovementsController],
  providers: [StockMovementsService, StockMovementsRepository],
  exports: [StockMovementsService],
})
export class StockMovementsModule {}