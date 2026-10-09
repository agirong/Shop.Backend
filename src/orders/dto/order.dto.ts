import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class OrderDto {
    @IsNumber()
    @IsNotEmpty({message: "El monto es requerido"})
    amount: number;

    @IsString()
    @IsNotEmpty({message: "La direccion de envio es requerida"})
    shippingAddress: string;
}