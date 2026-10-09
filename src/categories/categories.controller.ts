import { Controller, Get, Logger } from '@nestjs/common';
import { CategoriesService } from './categories.service.js';

@Controller('categories')
export class CategoriesController {
      private readonly logger = new Logger(CategoriesController.name);
      constructor(private readonly categoriesService: CategoriesService) {}
      
      @Get()
      async getCategories(
      ) {
        this.logger.log(`GET /categories/`)
        return this.categoriesService.getCategories();
      }
}
