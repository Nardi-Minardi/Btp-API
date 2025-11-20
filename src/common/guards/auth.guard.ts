import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();

    // OPTIONS untuk CORS preflight
    if (request.method === 'OPTIONS') return true;

    // Ambil token dari cookie dulu
    const tokenFromCookie = request.cookies?.auth_token;
    console.log('AuthGuard - token from cookie:', tokenFromCookie);

    // Fallback: ambil token dari Authorization header
    const tokenFromHeader = this.extractTokenFromHeader(request);
    console.log('AuthGuard - token from header:', tokenFromHeader);

    // Pilih yang ada
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      throw new HttpException('Unauthorized: Token missing', 401);
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      (request as any).user = payload;
    } catch (error) {
      throw new HttpException('Unauthorized: Invalid token', 401);
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
