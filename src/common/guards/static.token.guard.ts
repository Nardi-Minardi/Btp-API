import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class StaticTokenGuard implements CanActivate {
  constructor(private configService: ConfigService, private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true; // skip guard untuk @Public()

    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers['authorization'] || '';
    const tokenValue = authHeader.replace(/^Bearer\s+/i, '');
    const staticToken = this.configService.get<string>('STATIC_API_TOKEN');

    console.log({ authHeader, tokenValue, staticToken });

    if (!tokenValue || tokenValue !== staticToken) {
      throw new UnauthorizedException('Invalid Token');
    }

    return true;
  }
}
