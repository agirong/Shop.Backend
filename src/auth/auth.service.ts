import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { callProcedure } from '../Infraestructure/dbHelper.js';
import { RegisterLoginDto } from './dto/register-login.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
    constructor(private readonly dataSource: DataSource){}

      async validateCustomer(loginDto : LoginDto) {
        const result = await callProcedure(this.dataSource, 'sp_auth_Customers', [loginDto.email]);
        const customer = result[0];

        console.log('ver valor de customer ',customer);

        if(!customer){
            throw new UnauthorizedException('Credenciales invalidas');
        }

        const isPassValid = await bcrypt.compare(loginDto.password, customer.password);

        if(!isPassValid){
            throw new UnauthorizedException('Credenciales invalidas');            
        }

        const { pass_hash, ...userWithoutPassword } = customer;
        return userWithoutPassword;
      }

      async registerCustomer(registerLoginDto : RegisterLoginDto){
        const rondas = 10;
        const passHash = await bcrypt.hash(registerLoginDto.password, rondas);

        try{
            console.log('Error al guardar el cliente ', registerLoginDto)
            const result = await callProcedure(this.dataSource,'sp_register_Customer', [
                registerLoginDto.firstName,
                registerLoginDto.lastName,
                registerLoginDto.email,
                passHash
            ])
            return { message: 'Cliente registrado exitosamente', customerId: result[0].customer_id };
        }catch(error){
            console.log('Error al guardar el cliente ', error)
            throw new ConflictException('El correo ya se encuentra registrado');            
        }
      }
}


