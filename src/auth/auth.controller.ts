import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterLoginDto } from './dto/register-login.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { maskEmail } from '../utils/mask.js';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async validateCustomer(@Body() loginDto: LoginDto, @Req() req: Request) {
    this.logger.log(`POST /auth/login — ip: ${req.ip} — email: ${maskEmail(loginDto.email)}`);
    return this.authService.validateCustomer(loginDto);
  }

  @Post('register')
  async create(@Body() registerLoginDto: RegisterLoginDto, @Req() req: Request) {
    this.logger.log(`POST /auth/register — ip: ${req.ip} — email: ${maskEmail(registerLoginDto.email)}`);
    return this.authService.registerCustomer(registerLoginDto);
  }
}
