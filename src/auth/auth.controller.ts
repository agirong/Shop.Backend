import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterLoginDto } from './dto/register-login.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('login')
      async validateCustomer(
        @Body() loginDto: LoginDto,
      ) {
        return this.authService.validateCustomer(loginDto);
      }

    @Post('register')
     async create(@Body() registerLoginDto: RegisterLoginDto) {
        return this.authService.registerCustomer(registerLoginDto);
    }

}
