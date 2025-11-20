import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
  HttpCode,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { UserRole, AuthRequest } from './interface/auth.interface';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { WebResponse } from 'src/common/web.response';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Login',
    description:
      'Login dengan username dan password untuk mendapatkan JWT token',
  })
  @ApiBody({
    description: 'Login payload',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'superadmin@fews-cs7.id' },
        password: { type: 'string', example: 'superadmin123' },
      },
      required: ['email', 'password'],
    },
  })
  async login(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebResponse<any>> {
    const request = {
      ...body,
    };

    const result = await this.authService.login(request);

    const isProd = process.env.NODE_ENV === 'production';
    const maxAgeMs = process.env.EXPIRED_JWT_DAYS
      ? parseInt(process.env.EXPIRED_JWT_DAYS, 10) * 24 * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000; // 1 day default

    res.cookie('auth_token', result.access_token, {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: (isProd ? 'none' : 'lax') as any,
      domain: isProd ? process.env.COOKIE_DOMAIN || undefined : undefined,
      maxAge: maxAgeMs,
      path: '/',
    });

    return { status_code: HttpStatus.OK, message: 'Success', data: result };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh Access Token',
    description: 'Mendapatkan access token baru menggunakan refresh token',
  })
  @ApiBody({
    description: 'Refresh access token using refresh_token',
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh_token_sample_value',
        },
      },
      required: ['refresh_token'],
    },
  })
  async refresh(
    @Body() refreshDto: any,
  ): Promise<WebResponse<{ access_token: string }>> {
    const result = await this.authService.refreshToken(refreshDto);
    return { status_code: HttpStatus.OK, message: 'Success', data: result };
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get User Profile',
    description: 'Mendapatkan profil user yang sedang login',
  })
  async getProfile(@Request() req: AuthRequest): Promise<WebResponse<any>> {
    const result = await this.authService.getProfile(req.user.sub);
    return { status_code: HttpStatus.OK, message: 'Success', data: result };
  }

  //logout by removing cookie
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User Logout',
    description: 'Logout user dengan menghapus cookie auth_token',
  })
  async logout(
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebResponse<null>> {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: isProd ? true : false,
      sameSite: (isProd ? 'none' : 'lax') as any,
      domain: isProd ? process.env.COOKIE_DOMAIN || undefined : undefined,
      path: '/',
    });
    return {
      status_code: HttpStatus.OK,
      message: 'Logout successful',
      data: null,
    };
  }
}
