import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StockMovementsService } from './stock-movements.service';
import {
  CreateReceiptDto,
  CreateIssueDto,
  CreateTransferDto,
  CreateAdjustmentDto,
  CreateReservationDto,
  MovementQueryDto,
} from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Resource, Action } from '../users/entities/permission.entity';

@ApiTags('Stock Movements')
@Controller('stock-movements')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class StockMovementsController {
  constructor(private readonly movementsService: StockMovementsService) {}

  @Get()
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get all movements' })
  async findAll(@Query() query: MovementQueryDto) {
    return this.movementsService.findAll(query);
  }

  @Get('statistics')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get movement statistics' })
  async getStatistics() {
    return this.movementsService.getStatistics();
  }

  @Get(':id')
  @RequirePermissions(Resource.INVENTORY, Action.READ)
  @ApiOperation({ summary: 'Get movement by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.movementsService.findById(id);
  }

  @Post('receipts')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create receipt' })
  async createReceipt(@Body() dto: CreateReceiptDto, @CurrentUser() user: any) {
    return this.movementsService.createReceipt(dto, user.userId);
  }

  @Post('issues')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create issue' })
  async createIssue(@Body() dto: CreateIssueDto, @CurrentUser() user: any) {
    return this.movementsService.createIssue(dto, user.userId);
  }

  @Post('transfers')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create transfer' })
  async createTransfer(@Body() dto: CreateTransferDto, @CurrentUser() user: any) {
    return this.movementsService.createTransfer(dto, user.userId);
  }

  @Post('adjustments')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create adjustment' })
  async createAdjustment(@Body() dto: CreateAdjustmentDto, @CurrentUser() user: any) {
    return this.movementsService.createAdjustment(dto, user.userId);
  }

  @Post('reservations')
  @RequirePermissions(Resource.INVENTORY, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create reservation' })
  async createReservation(@Body() dto: CreateReservationDto, @CurrentUser() user: any) {
    return this.movementsService.createReservation(dto, user.userId);
  }

  @Patch(':id/approve')
  @RequirePermissions(Resource.INVENTORY, Action.APPROVE)
  @ApiOperation({ summary: 'Approve movement' })
  async approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.movementsService.approve(id, user.userId);
  }

  @Patch(':id/cancel')
  @RequirePermissions(Resource.INVENTORY, Action.UPDATE)
  @ApiOperation({ summary: 'Cancel movement' })
  async cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.movementsService.cancel(id);
  }
}