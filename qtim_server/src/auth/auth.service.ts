import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './strategies/jwt.strategy';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ email: dto.email, password: hashedPassword });
    await this.userRepo.save(user);

    return this.generateTokens(user);
  }

  async signin(dto: SigninDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async verifyTokens(accessToken: string, refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(accessToken);
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');
      return this.generateTokens(user);
    } catch (err) {
      try {
        const payload = this.jwtService.verify(refreshToken, this.config.get('JWT_REFRESH_SECRET')) as JwtPayload;
        const user = await this.userRepo.findOne({ where: { id: payload.sub } });
        if (!user) throw new UnauthorizedException('User not found');
        return this.generateTokens(user);
      } catch {
        throw new UnauthorizedException('Both tokens expired. Please login again');
      }
    }
  }

  private generateTokens(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
