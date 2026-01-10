import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportTemplate, ReportSchedule, ReportExecution } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([ReportTemplate, ReportSchedule, ReportExecution])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}