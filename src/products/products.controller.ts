import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('category/:categoryId')
  async getByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    return this.productsService.getByCategory(categoryId);
  }
}