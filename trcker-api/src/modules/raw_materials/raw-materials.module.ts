import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterialsController } from './raw-materials.controller';
import { RawMaterialsService } from './raw-materials.service';
import { RawMaterialsRepository } from './raw-materials.repository';
import { RawMaterial } from './entities/raw-material.entity';
import { RawMaterialBatch } from './entities/raw-material-batch.entity';
import { RawMaterialSupplier } from './entities/raw-material-supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RawMaterial,
      RawMaterialBatch,
      RawMaterialSupplier,
    ]),
  ],
  controllers: [RawMaterialsController],
  providers: [RawMaterialsService, RawMaterialsRepository],
  exports: [RawMaterialsService, RawMaterialsRepository],
})
export class RawMaterialsModule {}