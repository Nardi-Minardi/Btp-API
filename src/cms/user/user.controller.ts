import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CmsUserService } from './user.service';

@ApiTags('CMS/User Management')
@Controller('cms/users')
export class CmsUserController {
  constructor(private readonly cmsUserService: CmsUserService) {}

  @Get('/')
  // @UseGuards(RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  // @RequirePermission('users', 'read')
  @ApiOperation({
    summary: 'Get All Users',
    description: 'Mendapatkan daftar semua user (hanya admin dan operator)',
  })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @HttpCode(HttpStatus.OK)
  async getAllUsers(
    @Query('role_id') role_id: string,
    @Query('search') search?: string,
    @Query('offset') offset = '0',
    @Query('limit') limit = '50',
  ) {
    const pageNum = Math.max(parseInt(offset || '0', 10) || 0, 0) + 1;
    const limitNum = Math.min(
      Math.max(parseInt(limit || '50', 10) || 50, 1),
      200,
    );

    const { data: result, total } = await this.cmsUserService.getUsers({
      role_id: role_id ? parseInt(role_id, 10) : undefined,
      search,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
    });

    return {
      status_code: 200,
      message: 'success',
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      total_data: total,
      data: result,
    };
  }
}
