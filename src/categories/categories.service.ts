import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { callProcedure } from '../Infraestructure/dbHelper.js';

@Injectable()
export class CategoriesService {
    constructor(private readonly dataSource: DataSource) {}
        
  async getCategories() {
    return callProcedure(this.dataSource, 'sp_get_categories');
  }
}
