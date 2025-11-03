import { PrismaClient, Prisma } from '../node_modules/.prisma/main-client';

const prisma = new PrismaClient();

type LevelItem = {
  start: number;
  to: number | null;
  level: number;
  color: string | null;
  icon: string | null;
  name: string;
};

// Store icon as filename; client can resolve to /assets/icons/<file>
const icon = (file: string) => `${file}`;

const ARR_LEVELS: LevelItem[] = [
  {
    start: 0,
    to: 0.1,
    level: 0,
    color: '#F6F8FA',
    icon: icon('berawan.png'),
    name: 'Berawan',
  },
  {
    start: 0.2,
    to: 5,
    level: 1,
    color: '#88CAF9',
    icon: icon('hujan_ringan.png'),
    name: 'Hujan Ringan',
  },
  {
    start: 5.1,
    to: 10,
    level: 2,
    color: '#FAD493',
    icon: icon('hujan_sedang.png'),
    name: 'Hujan Sedang',
  },
  {
    start: 10.1,
    to: 20,
    level: 3,
    color: '#F29C6E',
    icon: icon('hujan_lebat.png'),
    name: 'Hujan Lebat',
  },
  {
    start: 20,
    to: null,
    level: 4,
    color: '#FF7979',
    icon: icon('hujan_sangat_lebat.png'),
    name: 'Hujan Sangat Lebat',
  },
];

const AWLR_LEVELS: LevelItem[] = [
  { start: 0, to: 0.1, level: 0, color: null, icon: null, name: 'Normal' },
  { start: 0.2, to: 5, level: 1, color: null, icon: null, name: 'Waspada' },
  { start: 5.1, to: 10, level: 2, color: null, icon: null, name: 'Siaga' },
  { start: 10.1, to: null, level: 3, color: null, icon: null, name: 'Awas' },
];

async function upsertCriteriaForTag(tagName: 'ARR' | 'AWLR' | 'AWS') {
  const tag = await prisma.m_device_tag.findUnique({
    where: { name: tagName },
  });
  if (!tag) {
    throw new Error(`Device tag ${tagName} not found. Seed device tags first.`);
  }
  const payload: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput =
    tagName === 'ARR'
      ? (ARR_LEVELS as unknown as Prisma.InputJsonValue)
      : tagName === 'AWLR'
        ? (AWLR_LEVELS as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull;
  // Use name as identifier per tag (one criteria per tag)
  const existing = await prisma.m_criteria.findFirst({
    where: { device_tag_id: tag.id, name: tagName },
  });
  if (existing) {
    await prisma.m_criteria.update({
      where: { id: existing.id },
      data: { criteria: payload, updated_at: new Date() },
    });
  } else {
    await prisma.m_criteria.create({
      data: { device_tag_id: tag.id, name: tagName, criteria: payload },
    });
  }
  console.log(`[seed-criteria] upserted ${tagName}`);
}

async function main() {
  console.log('[seed-criteria] starting...');
  await upsertCriteriaForTag('ARR');
  await upsertCriteriaForTag('AWLR');
  await upsertCriteriaForTag('AWS');
  console.log('[seed-criteria] done');
}

main()
  .catch((e) => {
    console.error('[seed-criteria] error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
