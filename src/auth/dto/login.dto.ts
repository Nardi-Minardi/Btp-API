export class LoginRequestDto {
  email: string;
  password: string;
}

export class LoginResponseDto {
  email: string;
  username: string;
  fullname: string | null;
  accessToken: string;
}

