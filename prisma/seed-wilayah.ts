import { PrismaClient } from '.prisma/main-client/client';

const prisma = new PrismaClient();

type WilayahItem = { id?: string | number; code?: string; name?: string };

const BASE = 'https://wilayah.id/api';

async function fetchJSON<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText} for ${url}`);
  }
  return (await res.json()) as T;
}

function getCode(x: any): string {
  const c = x?.code ?? x?.id;
  return String(c);
}

function getName(x: any): string {
  return String(x?.name ?? '');
}

function normalizeCode(code: string): string {
  return String(code).replace(/\./g, '');
}
function arrayFromWilayahResponse(x: any): any[] {
  if (Array.isArray(x)) return x;
  if (x && Array.isArray((x as any).data)) return (x as any).data;
  if (x && typeof x === 'object') return Object.values(x as Record<string, any>);
  return [];
}


function chunk<T>(arr: T[], size = 1000): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function seed() {
  const limitProvince = process.env.SEED_PROVINCE_CODE?.trim();

  console.log('[seed] starting...');

  // Clean tables (order: child -> parent)
  await prisma.m_kel_des.deleteMany({});
  await prisma.m_kecamatan.deleteMany({});
  await prisma.m_kab_kota.deleteMany({});
  await prisma.m_provinsi.deleteMany({});

  // Provinces
  const provincesRaw = await fetchJSON(`${BASE}/provinces.json`);
  const provinces: WilayahItem[] = arrayFromWilayahResponse(provincesRaw);
  const provs = provinces
    .map((p) => ({ codeApi: getCode(p), code: normalizeCode(getCode(p)), name: getName(p) }))
    .filter((p) => (limitProvince ? p.code === limitProvince : true));

  console.log(`[seed] provinces: inserting ${provs.length}`);
  for (const batch of chunk(provs, 1000)) {
    await prisma.m_provinsi.createMany({ data: batch.map(p => ({ code: p.code, name: p.name })) });
  }

  // Regencies, Districts, Villages
  for (const prov of provs) {
    console.log(`[seed] regencies for prov ${prov.code}`);
    const regenciesRaw = await fetchJSON(
      `${BASE}/regencies/${prov.codeApi}.json`,
    );
    const regencies: WilayahItem[] = arrayFromWilayahResponse(regenciesRaw);
    const regs = regencies.map((r) => ({ codeApi: getCode(r), code: normalizeCode(getCode(r)), name: getName(r) }));
    for (const batch of chunk(regs, 1000)) {
      await prisma.m_kab_kota.createMany({ data: batch.map(r => ({ code: r.code, name: r.name, provinsi_code: prov.code })) });
    }

    for (const reg of regs) {
      console.log(`[seed] districts for reg ${reg.code}`);
      const districtsRaw = await fetchJSON(
        `${BASE}/districts/${reg.codeApi}.json`,
      );
      const districts: WilayahItem[] = arrayFromWilayahResponse(districtsRaw);
      const dists = districts.map((d) => ({ codeApi: getCode(d), code: normalizeCode(getCode(d)), name: getName(d) }));
      for (const batch of chunk(dists, 1000)) {
        await prisma.m_kecamatan.createMany({ data: batch.map(d => ({ code: d.code, name: d.name, kab_kota_code: reg.code })) });
      }

      // villages per district
      for (const dist of dists) {
        console.log(`[seed] villages for dist ${dist.code}`);
        const villagesRaw = await fetchJSON(
          `${BASE}/villages/${dist.codeApi}.json`,
        );
        const villages: WilayahItem[] = arrayFromWilayahResponse(villagesRaw);
        if (villages.length) {
          const vils = villages.map((v) => ({ codeApi: getCode(v), code: normalizeCode(getCode(v)), name: getName(v) }));
          for (const batch of chunk(vils, 1000)) {
            await prisma.m_kel_des.createMany({ data: batch.map(v => ({ code: v.code, name: v.name, kecamatan_code: dist.code })) });
          }
        }
      }
    }
  }

  console.log('[seed] done');
}

seed()
  .catch((e) => {
    console.error('[seed] error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
