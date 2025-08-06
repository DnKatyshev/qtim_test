import { Controller, Post, Body, HttpCode, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  @HttpCode(200)
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Post('verify-token')
  @HttpCode(200)
  verifyTokens(@Body() body: { accessToken: string; refreshToken: string }) {
    if (!body?.accessToken || !body?.refreshToken) {
      throw new UnauthorizedException('Tokens required');
    }
    return this.authService.verifyTokens(body.accessToken, body.refreshToken);
  }
}