import { Pagination } from 'src/common/web.response';
import { UserDto } from './user.dto';

export class GetUserRequestPaginationDto {
  search?: string;
  page: string;
  limit: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Array<{ field: string; value: string }>;
}

export class GetUserResponsePaginationDto {
  data: UserDto[];
  pagination: Pagination;
}

export class GetUserRequestDto {
  userId: number;
}

export class GetUserResponseDto extends UserDto {}
