import { Injectable } from '@nestjs/common';
import { UsermanPrismaService } from 'src/common/prisma.service';
import { User } from '.prisma/userman-client';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: UsermanPrismaService) {}

  async findByEmailOrUsername(identifier: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { id } });
  }
}
