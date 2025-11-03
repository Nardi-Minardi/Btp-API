import { PrismaClient } from '../node_modules/.prisma/main-client';
import * as fs from 'fs/promises';
import * as path from 'path';

const prisma = new PrismaClient();

type Feature = {
	type: 'Feature';
	geometry: { type: string; coordinates: any } | null;
	properties?: Record<string, any> | null;
};

type FeatureCollection = {
	type: 'FeatureCollection';
	features: Feature[];
};

const GEOJSON_DIR = path.resolve(__dirname, '../src/data/geojson');

const FILE_PROV_MAP: Record<string, string> = {
	'CIMANUK-CISANGGARUNG.geojson': '32', // Jawa Barat
	'JRATUNSELUNA.geojson': '33', // Jawa Tengah
};

function toStr(v: any): string | null {
	if (v === undefined || v === null) return null;
	return String(v);
}

function toNum(v: any): number | null {
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}

async function readGeoJSON(filePath: string): Promise<FeatureCollection> {
	const raw = await fs.readFile(filePath, 'utf8');
	return JSON.parse(raw) as FeatureCollection;
}

async function seedFile(fileName: string) {
	const fullPath = path.join(GEOJSON_DIR, fileName);
	const provCode = FILE_PROV_MAP[fileName] ?? null;
	const data = await readGeoJSON(fullPath);

	console.log(`[seed-das] ${fileName}: ${data.features.length} features`);

	let inserted = 0;
	for (const f of data.features) {
		if (!f || !f.geometry) continue;
		const props = f.properties ?? {};

    const uid = toStr(props.id);
		const kode_das = toStr(props.kode_das);
		const name = toStr(props.name);
		const luas = toNum(props.luas);
		const ws_uid = toStr(props.ws_id);
		const color = toStr(props.color);

		const geomJson = JSON.stringify({
			type: f.geometry.type,
			coordinates: f.geometry.coordinates,
		});

		try {
			await prisma.$executeRaw`
				INSERT INTO "m_das" ("das_uid", "kode_das", "name", "luas", "ws_uid", "color", "geom", "provinsi_code")
				VALUES (${uid}, ${kode_das}, ${name}, ${luas}, ${ws_uid}, ${color}, ST_SetSRID(ST_GeomFromGeoJSON(${geomJson}), 4326), ${provCode})
			`;
			inserted++;
			if (inserted % 100 === 0) console.log(`[seed-das] ${fileName}: inserted ${inserted}`);
		} catch (e: any) {
			console.error('[seed-das] insert error', { fileName, name, kode_das, message: e?.message });
		}
	}

	console.log(`[seed-das] ${fileName}: done, inserted ${inserted}`);
}

async function main() {
	console.log('[seed-das] starting...');

	// Clean table
		await prisma.$executeRaw`DELETE FROM "m_das"`;

	// Seed known files only (explicit mapping ensures correct province assignment)
	for (const file of Object.keys(FILE_PROV_MAP)) {
		try {
			await seedFile(file);
		} catch (e: any) {
			console.error(`[seed-das] failed for ${file}:`, e?.message || e);
		}
	}

	console.log('[seed-das] done');
}

main()
	.catch((e) => {
		console.error('[seed-das] error', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

