import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { callProcedure } from '../Infraestructure/dbHelper.js';
import { RegisterLoginDto } from './dto/register-login.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import { maskEmail } from '../utils/mask.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly dataSource: DataSource, private readonly jwtService: JwtService) {}

  async validateCustomer(loginDto: LoginDto) {
    const masked = maskEmail(loginDto.email);
    this.logger.log(`Login attempt for: ${masked}`);

    let customer: any;
    try {
      const result = await callProcedure(this.dataSource, 'sp_auth_Customers', [loginDto.email]);
      customer = result[0];
    } catch (error) {
      this.logger.error(`DB error durante login para ${masked}`, (error as Error).stack);
      throw error;
    }

    if (!customer) {
      this.logger.warn(`Login failed — usuario no encontrado: ${masked}`);
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const isPassValid = await bcrypt.compare(loginDto.password, customer.pass_hash);
    if (!isPassValid) {
      this.logger.warn(`Login failed — credenciales invalidas para userId: ${customer.customer_id}`);
      throw new UnauthorizedException('Credenciales invalidas');
    }

    this.logger.log(`Login successful para userId: ${customer.customer_id}`);
    const payload = { sub: customer.customer_id, email: customer.email };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }

  async registerCustomer(registerLoginDto: RegisterLoginDto) {
    const masked = maskEmail(registerLoginDto.email);
    this.logger.log(`Register attempt for: ${masked}`);

    const rondas = 10;
    const passHash = await bcrypt.hash(registerLoginDto.password, rondas);

    try {
      const result = await callProcedure(this.dataSource, 'sp_register_Customer', [
        registerLoginDto.firstName,
        registerLoginDto.lastName,
        registerLoginDto.email,
        passHash
      ]);
      const customerId = result[0].customer_id;
      this.logger.log(`Customer registered successfully — userId: ${customerId}`);
      return { message: 'Cliente registrado exitosamente', customerId };
    } catch (error) {
      this.logger.warn(`Register failed — email already exists: ${masked}`);
      throw new ConflictException('El correo ya se encuentra registrado');
    }
  }
}
