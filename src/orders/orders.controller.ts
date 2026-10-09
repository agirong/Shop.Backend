import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrderDto } from './dto/order.dto.js';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';

@Controller('orders')
export class OrdersController {

    private readonly logger = new Logger(OrdersController.name);
    constructor(private readonly orderService: OrdersService){}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() orderDto: OrderDto, @CurrentUser() user: AuthenticatedUser) {
        this.logger.log(`POST /orders/ — customerId: ${user.userId}`);
        return this.orderService.addOrder(user.userId, orderDto);
    }
}
