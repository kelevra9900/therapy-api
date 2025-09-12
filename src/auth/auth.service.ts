import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import {LoginDto,RegisterDto} from './dto/auth.dto';
import {PrismaService} from '../prisma/prisma.service';
import {jwtConstants} from 'src/utils/constants';
import {Role, SubscriptionStatus} from '@prisma/client';
import {MailService} from '@/mail/mail.service';
import {randomUUID} from 'crypto';
import {PasswordResetService} from './password-reset.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly passwordResetService: PasswordResetService,
    private readonly configService: ConfigService,
  ) { }


  async signIn(loginRequest: LoginDto) {
    const {email,password} = loginRequest;

    const user = await this.prisma.user.findUnique({
      where: {email},
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }


    const isPasswordValid = await bcrypt.compare(password,user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload,{
      secret: jwtConstants.secret,
      expiresIn: '1h',
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }


  async validateUser(username: string,pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {email: username},
    });
    return user;
  }

  async validateUserByEmail(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {email},
    });
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password,salt);
  }

  async comparePassword(password: string,hash: string): Promise<boolean> {
    return bcrypt.compare(password,hash);
  }

  async createUser({email,password,name}: RegisterDto) {
    const hashedPassword = await this.hashPassword(password);


    return this.prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: Role.THERAPIST,
        subscriptionStatus: SubscriptionStatus.INACTIVE
      },
    });
  }
    async sendForgotPasswordEmail(email: string): Promise<{ message: string }> {
      const user = await this.prisma.user.findUnique({
        where: {
          email
        }
      })

      if (!user) {
        return { message: 'If that email is registered, a reset link will be sent shortly.' };
      }

      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

      await this.passwordResetService.create({
        userId: user.id,
        token,
        expiresAt,
      });

      const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

      await this.mailService.sendResetPasswordEmail(user.email, resetUrl);

      return { message: 'Reset link sent to your email address.' };
    }

}
