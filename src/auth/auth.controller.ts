import { Controller, Headers, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

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

  @UseGuards(AuthGuard('auth-strategy'))
  @Post('login/passport')
  loginUserPassport(@Request() req) {
    return req.user;
  }
}
