import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BomController } from './bom.controller';
import { BomService } from './bom.service';
import { BomRepository } from './bom.repository';
import { Bom } from './entities/bom.entity';
import { BomItem } from './entities/bom-item.entity';
import { BomVersion } from './entities/bom-version.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bom, BomItem, BomVersion])],
  controllers: [BomController],
  providers: [BomService, BomRepository],
  exports: [BomService, BomRepository],
})
export class BomModule { }
