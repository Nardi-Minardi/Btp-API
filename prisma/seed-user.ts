import { PrismaClient } from '../node_modules/.prisma/main-client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type SeedUser = {
  username: string;
  email: string;
  password: string; // plain, will be hashed
  full_name: string;
  instansi_id?: number | null;
  wilayah_kerja: string[];
  is_active?: boolean;
  role_id?: number;
  jabatan_id?: number | null;
};

const USERS: SeedUser[] = [
  {
    username: 'superadmin',
    email: 'superadmin@fews-cs7.id',
    password: 'superadmin123',
    full_name: 'Super Administrator CS7',
    role_id: 1,
    jabatan_id: null,
    instansi_id: null,
    wilayah_kerja: ['all'],
    is_active: true,
  },
  {
    username: 'kasubdit_cimanuk_cisanggarung',
    email: 'kasubdit_cimanuk_cisanggarung@gmail.com',
    password: 'kasubdit123',
    full_name: 'Kasubdit BBWS CIMANUK CISANGGARUNG',
    role_id: 2,
    jabatan_id: 6,
    instansi_id: 1,
    wilayah_kerja: ['cirebon', 'indramayu', 'subang'],
    is_active: true,
  },
  {
    username: 'operator_cimanuk_cisanggarung',
    email: 'operator_cimanuk_cisanggarung@gmail.com',
    password: 'operator123',
    full_name: 'Operator BBWS CIMANUK CISANGGARUNG',
    jabatan_id: 11,
    role_id: 3,
    instansi_id: 1,
    wilayah_kerja: ['cirebon', 'indramayu', 'subang'],
    is_active: true,
  },
  {
    username: 'kasbudit_pemali_juana',
    email: 'kasbudit_pemali_juana@gmail.com',
    password: 'kasubdit123',
    full_name: 'Kasubdit BBWS PEMALI JUANA',
    jabatan_id: 6,
    role_id: 2,
    instansi_id: 2,
    wilayah_kerja: ['semarang'],
    is_active: true,
  },
  {
    username: 'operator_pemali_juana',
    email: 'operator_pemali_juana@gmail.com',
    password: 'operator123',
    full_name: 'Operator BBWS PEMALI JUANA',
    jabatan_id: 11,
    role_id: 3,
    instansi_id: 2,
    wilayah_kerja: ['semarang'],
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
          jabatan_id: u.jabatan_id ?? null,
          role_id: u.role_id, 
          instansi_id: u.instansi_id ?? null,
          wilayah_kerja: u.wilayah_kerja,
          is_active: u.is_active ?? true,
          updated_at: now,
        },
        create: {
          username: u.username,
          email: u.email,
          password: hashed,
          full_name: u.full_name,
          jabatan_id: u.jabatan_id ?? null,
          role_id: u.role_id, 
          instansi_id: u.instansi_id ?? null,
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
