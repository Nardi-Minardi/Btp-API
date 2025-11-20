import { PrismaClient } from '../node_modules/.prisma/main-client';

const prisma = new PrismaClient();

const ROLES = [
  {
    name: 'SUPERADMIN',
    description: 'Memiliki seluruh akses sistem',
  },
  {
    name: 'ADMIN',
    description: 'Mengelola konfigurasi dan data utama',
  },
  {
    name: 'OPERATOR',
    description: 'Mengoperasikan fungsi harian dan operasional',
  },
  {
    name: 'USER',
    description: 'Pengguna umum sistem',
  },
];

async function main() {
  console.log('[seed-roles] starting...');

  for (const role of ROLES) {
    const existing = await prisma.m_roles.findFirst({
      where: { name: role.name },
    });

    if (existing) {
      await prisma.m_roles.update({
        where: { id: existing.id },
        data: {
          description: role.description,
          updated_at: new Date(),
        },
      });
      console.log(`[seed-roles] updated ${role.name}`);
    } else {
      await prisma.m_roles.create({
        data: {
          name: role.name,
          description: role.description,
        },
      });
      console.log(`[seed-roles] created ${role.name}`);
    }
  }

  console.log('[seed-roles] done');
}

main()
  .catch((e) => {
    console.error('[seed-roles] error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
