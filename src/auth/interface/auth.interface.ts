export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  USER = 'USER',
}

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  full_name: string;
  jabatan: string;
  role: UserRole;
  instansi_id: number | null;
  wilayah_kerja?: string[]; // Array of area IDs that user can access
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

export interface JwtPayload {
  sub: number; // user id
  username: string;
  email: string;
  role_id: number | null;
  jabatan_id?: number | null;
  instansi_id?: number | null;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expired_at: number; // in seconds
  user: any
}

export interface AuthRequest extends Request {
  user: JwtPayload;
}
