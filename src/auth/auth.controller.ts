import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {LoginDto, RegisterDto} from './dto/auth.dto';
import {ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse} from '@nestjs/swagger';
import {ForgotPasswordDto} from './dto/forgot-password.dto';
import {ChangePasswordDto} from './dto/change-password.dto';
import {Roles} from '@/common/roles.decorator';
import {Role} from '@prisma/client';
import {AuthGuard} from './auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {JwtPayload} from './types';
import {User} from '@/common/decorators/user.decorator';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'User login', description: 'Authenticate a user with email and password.' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Login successful. Returns access token and user info.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or user not found.' })
  signIn(@Body() signInDto: LoginDto) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiOperation({ summary: 'Register new user', description: 'Create a new user account.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid registration data.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.createUser(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Reset password email sent if user exists' })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.sendForgotPasswordEmail(dto.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(AuthGuard,RolesGuard)
  @Roles(Role.THERAPIST)
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({ description: 'Password updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Passwords mismatch, user not found, or current password invalid.' })
  async changePassword(
    @Body() body: ChangePasswordDto,
    @User() user: JwtPayload
  ) {
    const { actualPassword, newPassword, confirmPassword } = body;
    return this.authService.changePassword(
      user.sub,
      actualPassword,
      newPassword,
      confirmPassword,
    );
  }
}
