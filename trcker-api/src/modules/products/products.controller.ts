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
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
  BulkUpdatePricesDto,
  BulkUpdatePricesResponseDto,
} from './dto';
import { Product } from './entities/product.entity';
import { PaginatedProductsResponse } from './interfaces/product-response.interface';
import { ProductStatistics } from './interfaces/product-statistics.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Resource, Action } from '../users/entities/permission.entity';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermissions(Resource.PRODUCTS, Action.READ)
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve paginated list of products with filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async findAll(@Query() query: ProductQueryDto): Promise<PaginatedProductsResponse> {
    return this.productsService.findAll(query);
  }

  @Get('statistics')
  @RequirePermissions(Resource.PRODUCTS, Action.READ)
  @ApiOperation({
    summary: 'Get product statistics',
    description: 'Retrieve comprehensive product statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStatistics(): Promise<ProductStatistics> {
    return this.productsService.getProductStatistics();
  }

  @Get('low-stock')
  @RequirePermissions(Resource.PRODUCTS, Action.READ)
  @ApiOperation({
    summary: 'Get low stock products',
    description: 'Retrieve products below reorder level',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock products retrieved successfully',
  })
  async getLowStockProducts(): Promise<Product[]> {
    return this.productsService.getLowStockProducts();
  }

  @Get('search')
  @RequirePermissions(Resource.PRODUCTS, Action.READ)
  @ApiOperation({
    summary: 'Search products',
    description: 'Search products by SKU, name, or barcode',
  })
  @ApiQuery({ name: 'q', type: String, description: 'Search query' })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Result limit',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ): Promise<Product[]> {
    return this.productsService.searchProducts(query, limit);
  }

  @Get('category/:categoryId')
  @RequirePermissions(Resource.PRODUCTS, Action.READ)
  @ApiOperation({
    summary: 'Get products by category',
    description: 'Retrieve all products in a specific category',
  })
  @ApiParam({ name: 'categoryId', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async findByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ): Promise<Product[]> {
    return this.productsService.findByCategory(categoryId);
  }

  @Get('sku/:sku')
  @RequirePermissions(Resource.PRODUCTS, Action.READ)
  @ApiOperation({
    summary: 'Get product by SKU',
    description: 'Retrieve product by Stock Keeping Unit',
  })
  @ApiParam({ name: 'sku', type: String })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findBySku(@Param('sku') sku: string): Promise<Product> {
    return this.productsService.findBySku(sku);
  }

  @Get(':id')
  @RequirePermissions(Resource.PRODUCTS, Action.READ)
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve detailed product information',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findById(id);
  }

  @Post()
  @RequirePermissions(Resource.PRODUCTS, Action.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new product',
    description: 'Create a new product in the catalog',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 409,
    description: 'SKU or barcode already exists',
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Post('bulk-update-prices')
  @RequirePermissions(Resource.PRODUCTS, Action.UPDATE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update product prices',
    description: 'Update prices for multiple products at once',
  })
  @ApiResponse({
    status: 200,
    description: 'Prices updated successfully',
  })
  async bulkUpdatePrices(
    @Body() bulkUpdateDto: BulkUpdatePricesDto,
  ): Promise<BulkUpdatePricesResponseDto> {
    return this.productsService.bulkUpdatePrices(bulkUpdateDto);
  }

  @Post(':id/duplicate')
  @RequirePermissions(Resource.PRODUCTS, Action.CREATE)
  @ApiOperation({
    summary: 'Duplicate product',
    description: 'Create a copy of an existing product',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiQuery({ name: 'newSku', type: String, description: 'New SKU for duplicate' })
  @ApiQuery({
    name: 'newName',
    type: String,
    required: false,
    description: 'New name for duplicate',
  })
  @ApiResponse({
    status: 201,
    description: 'Product duplicated successfully',
    type: Product,
  })
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('newSku') newSku: string,
    @Query('newName') newName?: string,
  ): Promise<Product> {
    return this.productsService.duplicate(id, newSku, newName);
  }

  @Put(':id')
  @RequirePermissions(Resource.PRODUCTS, Action.UPDATE)
  @ApiOperation({
    summary: 'Update product',
    description: 'Update product information',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @RequirePermissions(Resource.PRODUCTS, Action.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete product',
    description: 'Soft delete product',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  @Patch(':id/restore')
  @RequirePermissions(Resource.PRODUCTS, Action.UPDATE)
  @ApiOperation({
    summary: 'Restore deleted product',
    description: 'Restore a soft-deleted product',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Product restored successfully',
    type: Product,
  })
  async restore(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.restore(id);
  }

  @Patch(':id/activate')
  @RequirePermissions(Resource.PRODUCTS, Action.UPDATE)
  @ApiOperation({
    summary: 'Activate product',
    description: 'Activate product for sale and use',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Product activated successfully',
    type: Product,
  })
  async activate(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.activate(id);
  }

  @Patch(':id/deactivate')
  @RequirePermissions(Resource.PRODUCTS, Action.UPDATE)
  @ApiOperation({
    summary: 'Deactivate product',
    description: 'Deactivate product',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Product deactivated successfully',
    type: Product,
  })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.deactivate(id);
  }
}