import { Controller, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Headers('authorization') token: string) {
    return this.authService.register(token);
  }

  @Post('login')
  login(@Headers('authorization') token: string) {
    return this.authService.login(token);
  }
}
