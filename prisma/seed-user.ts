import { PrismaClient } from '../node_modules/.prisma/main-client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedUser = {
  username: string;
  email: string;
  password: string; // plain, will be hashed
  full_name: string;
  jabatan: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'OPERATOR' | 'USER';
  instansi: string;
  wilayah_kerja: string[];
  is_active?: boolean;
};

const USERS: SeedUser[] = [
  {
    username: 'superadmin',
    email: 'superadmin@fews-cs7.id',
    password: 'superadmin123',
    full_name: 'Super Administrator FEWS',
    jabatan: 'Kepala Divisi IT',
    role: 'SUPERADMIN',
    instansi: 'BMKG Pusat',
    wilayah_kerja: ['all'],
    is_active: true,
  },
  {
    username: 'admin',
    email: 'admin@fews-cs7.id',
    password: 'admin123',
    full_name: 'Administrator FEWS',
    jabatan: 'Administrator Sistem',
    role: 'ADMIN',
    instansi: 'BMKG Pusat',
    wilayah_kerja: ['all'],
    is_active: true,
  },
  {
    username: 'operator_jabar',
    email: 'operator.jabar@fews-cs7.id',
    password: 'operator123',
    full_name: 'Operator FEWS Jawa Barat',
    jabatan: 'Operator Monitoring',
    role: 'OPERATOR',
    instansi: 'BMKG Jawa Barat',
    wilayah_kerja: ['jabar', 'bandung', 'bogor', 'bekasi'],
    is_active: true,
  },
  {
    username: 'user_bandung',
    email: 'user.bandung@fews-cs7.id',
    password: 'user123',
    full_name: 'Analis Data Pemkot Bandung',
    jabatan: 'Analis Data',
    role: 'USER',
    instansi: 'Pemkot Bandung - Dinas Lingkungan Hidup',
    wilayah_kerja: ['bandung'],
    is_active: true,
  },
  {
    username: 'user_bpbd',
    email: 'user.bpbd@fews-cs7.id',
    password: 'user123',
    full_name: 'Staff BPBD Jawa Barat',
    jabatan: 'Staff Mitigasi Bencana',
    role: 'USER',
    instansi: 'BPBD Provinsi Jawa Barat',
    wilayah_kerja: ['jabar', 'bandung', 'bogor', 'bekasi'],
    is_active: true,
  },
];

async function main() {
  console.log('[seed-user] starting...');

  for (const u of USERS) {
    try {
      const hashed = await bcrypt.hash(u.password, 10);
      const now = new Date();
      await prisma.m_users.upsert({
        where: { username: u.username },
        update: {
          email: u.email,
          password: hashed,
          full_name: u.full_name,
          jabatan: u.jabatan,
          role: u.role as any,
          instansi: u.instansi,
          wilayah_kerja: u.wilayah_kerja,
          is_active: u.is_active ?? true,
          updated_at: now,
        },
        create: {
          username: u.username,
          email: u.email,
          password: hashed,
          full_name: u.full_name,
          jabatan: u.jabatan,
          role: u.role as any,
          instansi: u.instansi,
          wilayah_kerja: u.wilayah_kerja,
          is_active: u.is_active ?? true,
          created_at: now,
          updated_at: now,
          last_login: null,
        },
      });
      console.log(`[seed-user] upserted ${u.username}`);
    } catch (e: any) {
      console.error(`[seed-user] failed for ${u.username}:`, e?.message || e);
    }
  }

  console.log('[seed-user] done');
}

main()
  .catch((e) => {
    console.error('[seed-user] error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
