import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {LoginDto,RegisterDto} from './dto/auth.dto';
import {PrismaService} from '../prisma/prisma.service';
import {jwtConstants} from 'src/utils/constants';
import {Role, SubscriptionStatus} from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
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
}
