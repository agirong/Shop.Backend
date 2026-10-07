import { Controller, Get, Logger, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';

@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll(
  ) {
    this.logger.log(`GET /products/`)
    return this.productsService.getAllProducts();
  }

  @UseGuards(JwtAuthGuard)
  @Get('category/:categoryId')
  async getByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    this.logger.log(`GET /category/:categoryId — categoryId: ${categoryId}`)
    return this.productsService.getByCategory(categoryId);
  }
}