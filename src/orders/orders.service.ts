import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { OrderDto } from './dto/order.dto.js';
import { callProcedure } from '../Infraestructure/dbHelper.js';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);
    constructor(private readonly dataSource : DataSource){}

    async addOrder(customerId : number, ordetDto : OrderDto){
        try {
            const result = await callProcedure(this.dataSource, 'sp_create_order', [
                customerId,
                ordetDto.amount,
                ordetDto.shippingAddress
            ]);
            const orderId = result[0].order_id;
            this.logger.log(`Order registered successfully — orderId: ${orderId}`);
            return { message: 'Orden registrada exitosamente', orderId };
        } catch (error) {
            this.logger.warn(`Create order failed — : ${error}`);
            throw new ConflictException('La orden ya se encuentra registrada');
        }
    }
}
