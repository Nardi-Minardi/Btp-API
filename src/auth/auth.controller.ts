import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login.dto';
import { WebResponse } from 'src/common/web.response';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(200)
  async login(@Body() request: any): Promise<WebResponse<LoginResponseDto>> {
    const result = await this.authService.login(request);
    return {
      statusCode: 200,
      message: 'Login success',
      data: result,
    };
  }
}
