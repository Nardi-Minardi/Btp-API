import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class RestanRepository {
  constructor(private readonly prisma: PrismaService) {}


}
