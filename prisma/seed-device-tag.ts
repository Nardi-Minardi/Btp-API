import { PrismaClient } from '../node_modules/.prisma/main-client';

const prisma = new PrismaClient();

const TAGS = ['ARR', 'AWLR', 'AWS'];

async function main() {
	console.log('[seed-device-tag] starting...');
	for (const name of TAGS) {
		try {
			await prisma.m_device_tag.upsert({
				where: { name },
				update: { updated_at: new Date() },
				create: { name },
			});
			console.log(`[seed-device-tag] upserted ${name}`);
		} catch (e: any) {
			console.error(`[seed-device-tag] failed for ${name}:`, e?.message || e);
		}
	}
	console.log('[seed-device-tag] done');
}

main()
	.catch((e) => {
		console.error('[seed-device-tag] error:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

