import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';

export class LocalAuthGuard extends AuthGuard('auth-strategy') {}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'auth-strategy') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  /**
   * This method is called by Passport.js to validate the user credentials.
   * @param email - The username provided by the user.
   * @param password - The password provided by the user.
   * @returns A promise that resolves with the user object if validation is successful.
   */
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.authenticate(email, password);

    return user;
  }
}
