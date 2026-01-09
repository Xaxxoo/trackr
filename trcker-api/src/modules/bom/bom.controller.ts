import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BomService } from './bom.service';
import {
  CreateBomDto,
  UpdateBomDto,
  BomQueryDto,
  AddBomItemDto,
  UpdateBomItemDto,
  CreateBomVersionDto,
} from './dto';
import { Bom } from './entities/bom.entity';
import { BomItem } from './entities/bom-item.entity';
import { BomVersion } from './entities/bom-version.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Resource, Action } from '../users/entities/permission.entity';

@ApiTags('BOM (Bill of Materials)')
@Controller('bom')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class BomController {
  constructor(private readonly bomService: BomService) {}

  // ==================== BOM CRUD ====================

  @Get()
  @RequirePermissions(Resource.BOM, Action.READ)
  @ApiOperation({ summary: 'Get all BOMs' })
  async findAll(@Query() query: BomQueryDto) {
    return this.bomService.findAll(query);
  }

  @Get('statistics')
  @RequirePermissions(Resource.BOM, Action.READ)
  @ApiOperation({ summary: 'Get BOM statistics' })
  async getStatistics() {
    return this.bomService.getBomStatistics();
  }

  @Get(':id')
  @RequirePermissions(Resource.BOM, Action.READ)
  @ApiOperation({ summary: 'Get BOM by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Bom> {
    return this.bomService.findById(id);
  }

  @Get('number/:bomNumber')
  @RequirePermissions(Resource.BOM, Action.READ)
  @ApiOperation({ summary: 'Get BOM by number' })
  async findByNumber(@Param('bomNumber') bomNumber: string): Promise<Bom> {
    return this.bomService.findByBomNumber(bomNumber);
  }

  @Post()
  @RequirePermissions(Resource.BOM, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create BOM' })
  async create(
    @Body() dto: CreateBomDto,
    @CurrentUser() user: any,
  ): Promise<Bom> {
    return this.bomService.create(dto, user.userId);
  }

  @Put(':id')
  @RequirePermissions(Resource.BOM, Action.UPDATE)
  @ApiOperation({ summary: 'Update BOM' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBomDto,
  ): Promise<Bom> {
    return this.bomService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Resource.BOM, Action.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete BOM' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.bomService.remove(id);
  }

  @Patch(':id/restore')
  @RequirePermissions(Resource.BOM, Action.UPDATE)
  @ApiOperation({ summary: 'Restore deleted BOM' })
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<Bom> {
    return this.bomService.restore(id);
  }

  @Patch(':id/activate')
  @RequirePermissions(Resource.BOM, Action.APPROVE)
  @ApiOperation({ summary: 'Activate BOM' })
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<Bom> {
    return this.bomService.activate(id);
  }

  @Patch(':id/deactivate')
  @RequirePermissions(Resource.BOM, Action.UPDATE)
  @ApiOperation({ summary: 'Deactivate BOM' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<Bom> {
    return this.bomService.deactivate(id);
  }

  @Patch(':id/approve')
  @RequirePermissions(Resource.BOM, Action.APPROVE)
  @ApiOperation({ summary: 'Approve BOM' })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ): Promise<Bom> {
    return this.bomService.approve(id, user.userId);
  }

  // ==================== BOM ITEMS ====================

  @Get(':id/items')
  @RequirePermissions(Resource.BOM, Action.READ)
  @ApiOperation({ summary: 'Get BOM items' })
  async getBomItems(@Param('id', ParseUUIDPipe) id: string): Promise<BomItem[]> {
    return this.bomService.getBomItems(id);
  }

  @Post(':id/items')
  @RequirePermissions(Resource.BOM, Action.UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add item to BOM' })
  async addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddBomItemDto,
  ): Promise<BomItem> {
    return this.bomService.addItem(id, dto);
  }

  @Put('items/:itemId')
  @RequirePermissions(Resource.BOM, Action.UPDATE)
  @ApiOperation({ summary: 'Update BOM item' })
  async updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateBomItemDto,
  ): Promise<BomItem> {
    return this.bomService.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @RequirePermissions(Resource.BOM, Action.UPDATE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove item from BOM' })
  async removeItem(@Param('itemId', ParseUUIDPipe) itemId: string): Promise<void> {
    return this.bomService.removeItem(itemId);
  }

  // ==================== BOM VERSIONS ====================

  @Get(':id/versions')
  @RequirePermissions(Resource.BOM, Action.READ)
  @ApiOperation({ summary: 'Get BOM versions' })
  async getVersions(@Param('id', ParseUUIDPipe) id: string): Promise<BomVersion[]> {
    return this.bomService.getBomVersions(id);
  }

  @Post(':id/versions')
  @RequirePermissions(Resource.BOM, Action.UPDATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new BOM version' })
  async createVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateBomVersionDto,
    @CurrentUser() user: any,
  ): Promise<Bom> {
    return this.bomService.createVersion(id, dto, user.userId);
  }

  @Post('versions/:versionId/restore')
  @RequirePermissions(Resource.BOM, Action.UPDATE)
  @ApiOperation({ summary: 'Restore BOM from version' })
  async restoreVersion(
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @CurrentUser() user: any,
  ): Promise<Bom> {
    return this.bomService.restoreVersion(versionId, user.userId);
  }

  // ==================== BOM ANALYSIS ====================

  @Get(':id/cost-analysis')
  @RequirePermissions(Resource.BOM, Action.READ)
  @ApiOperation({ summary: 'Get BOM cost analysis' })
  async getCostAnalysis(@Param('id', ParseUUIDPipe) id: string) {
    return this.bomService.getCostAnalysis(id);
  }

  @Get(':id/explosion')
  @RequirePermissions(Resource.BOM, Action.READ)
  @ApiOperation({ summary: 'Get BOM explosion (multi-level)' })
  @ApiQuery({ name: 'quantity', required: false, description: 'Quantity multiplier' })
  async getBomExplosion(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('quantity') quantity?: number,
  ) {
    return this.bomService.getBomExplosion(id, quantity || 1);
  }
}