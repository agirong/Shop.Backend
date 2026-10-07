import { Body, Controller, Logger, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterLoginDto } from './dto/register-login.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { maskEmail } from '../utils/mask.js';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import type { AuthenticatedUser } from './current-user.decorator.js';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {}

  @Post('login')
  async validateCustomer(@Body() loginDto: LoginDto, @Req() req: ExpressRequest, @Res({ passthrough: true }) res: ExpressResponse) {
    this.logger.log(`POST /auth/login — email: ${maskEmail(loginDto.email)}`);
    const { access_token, refresh_token } = await this.authService.validateCustomer(loginDto);

    // El refresh token va en cookie httpOnly — JS del frontend no puede leerla
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // solo HTTPS en prod
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
    });

    return { access_token };  // el access token sí va en el body
  }
  
  @Post('register')
  async create(@Body() registerLoginDto: RegisterLoginDto, @Req() req: Request) {
    this.logger.log(`POST /auth/register — email: ${maskEmail(registerLoginDto.email)}`);
    return this.authService.registerCustomer(registerLoginDto);
  }

  @Post('refresh')
  async refresh(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: ExpressResponse) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new UnauthorizedException('No refresh token');

    // Decodifica sin verificar solo para obtener el userId
    const decoded = this.jwtService.decode(refreshToken) as { sub: number };
    const { access_token, refresh_token } = await this.authService.refreshAccessToken(decoded.sub, refreshToken);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { access_token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: ExpressResponse
  ) {
    await this.authService.logout(user.userId);
    res.clearCookie('refresh_token');
    return { message: 'Sesión cerrada' };
  }
}
