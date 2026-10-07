import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { callProcedure } from '../Infraestructure/dbHelper.js';
import { RegisterLoginDto } from './dto/register-login.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtService } from '@nestjs/jwt';
import { maskEmail } from '../utils/mask.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly dataSource: DataSource, 
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

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
    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.generateRefreshToken(customer.customer_id);

    return { access_token, refresh_token };
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

  private async generateRefreshToken(userId: number): Promise<string>{
    const token = await this.jwtService.signAsync(
      {sub: userId},
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN')
      }
    );

    this.logger.log(`Refresh token: ${token}`);

    const tokenHash = await bcrypt.hash(token,10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate()+7);

    await callProcedure(this.dataSource, 'sp_save_refresh_token', [userId, tokenHash, expiresAt]);
    return token
  }

  async refreshAccessToken(userId: number, refreshToken: string) {
    const result = await callProcedure(this.dataSource, 'sp_find_refresh_token', [userId]);
    const stored = result[0];

    if (!stored) throw new UnauthorizedException('Refresh token inválido');

    const isValid = await bcrypt.compare(refreshToken, stored.token_hash);
    if (!isValid) throw new UnauthorizedException('Refresh token inválido');

    // Verifica firma con el secreto correcto
    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Genera nuevo access token (y rota el refresh token)
    const access_token = await this.jwtService.signAsync({ sub: userId, });
    const new_refresh_token = await this.generateRefreshToken(userId);

    return { access_token, refresh_token: new_refresh_token };
  }

  async logout(userId: number){
    await callProcedure(this.dataSource, 'sp_delete_refresh_token', [userId]);
    this.logger.log(`Logout - userId: ${userId}`);    
  }
}
