import { Injectable } from '@nestjs/common';
import { callProcedure } from '../Infraestructure/dbHelper.js';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(private readonly dataSource: DataSource) {}

  async getAllProducts() {
    return callProcedure(this.dataSource, 'sp_get_products');
  }

  async getByCategory(categoryId: number) {
    return callProcedure(this.dataSource, 'sp_get_products_by_category', [categoryId]);
  }

}
