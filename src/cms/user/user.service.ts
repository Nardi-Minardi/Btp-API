import { Injectable, HttpException, Logger, Inject } from '@nestjs/common';
import { ValidationService } from 'src/common/validation.service';
import { CmsUserRepository } from './user.repository';
import { User, UserRole } from 'src/auth/interface/auth.interface';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

// Public user DTO without sensitive fields
type PublicUser = Omit<User, 'password'>;

@Injectable()
export class CmsUserService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private readonly validationService: ValidationService,
    private readonly cmsUserRepository: CmsUserRepository,
  ) {}

  async getUsers(request: {
    role_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: PublicUser[]; total: number }> {
    this.logger.debug('Request get users with params', { request });
    
    // Ambil data user
    const users = await this.cmsUserRepository.findAllUser({
      role_id: request.role_id,
      search: request.search,
      limit: request.limit,
      offset: request.offset,
    });

    // Hitung total user
    const total = await this.cmsUserRepository.countAllUser({
      role_id: request.role_id,
      search: request.search,
    });

    // Mapping user supaya password tidak ikut
    const mappedUsers: PublicUser[] = users.map((raw: any) => {
      const { password, m_jabatan, m_roles, ...rest } = raw;

      return {
        ...rest,
        jabatan: rest.jabatan ?? m_jabatan?.name ?? '',
        role: (rest.role ?? m_roles?.name) as UserRole,
      };
    });

    return {
      data: mappedUsers,
      total: total ?? 0,
    };
  }
}

