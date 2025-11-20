import { PrismaClient } from '../node_modules/.prisma/main-client';

const prisma = new PrismaClient();

const JABATAN = [
	{
		name: "Dirut / Kepala Lembaga / Menteri",
		description: null,
		kelompok: ["Direktur Utama", "Kepala Lembaga", "Menteri"],
	},
	{
		name: "Deputi / Wakil Dirut",
		description: "Membawahi bidang tertentu",
		kelompok: ["Deputi", "Wakil Direktur Utama"],
	},
	{
		name: "Direktur",
		description: "Memimpin Divisi / Departemen",
		kelompok: ["Direktur"],
	},
	{
		name: "Kepala Biro",
		description: null,
		kelompok: ["Kepala Biro"],
	},
	{
		name: "Kepala Dinas",
		description: null,
		kelompok: ["Kepala Dinas"],
	},
	{
		name: "Kepala Bagian / Kabsudit",
		description: "Termasuk Kepala Auditor",
		kelompok: ["Kepala Bagian", "Kabsudit", "Kepala Auditor"],
	},
	{
		name: "Sekretaris",
		description: "Membantu administrasi & koordinasi",
		kelompok: ["Sekretaris"],
	},
	{
		name: "Kabid (Kepala Bidang)",
		description: null,
		kelompok: ["Kepala Bidang"],
	},
	{
		name: "Kepala Seksi / Kepala Sub-Bidang",
		description: "Kasi",
		kelompok: ["Kepala Seksi", "Kepala Sub-Bidang", "Kasi"],
	},
	{
		name: "Kepala Unit Fungsional",
		description: "Unit seperti Laboratorium / Pustaka / Penelitian",
		kelompok: [
			"Kepala Laboratorium",
			"Kepala Perpustakaan",
			"Kepala Penelitian",
		],
	},
	{
		name: "Jabatan Fungsional Teknis",
		description: "Auditor, Peneliti, Pranata Komputer, Arsiparis, dll",
		kelompok: [
			"Auditor",
			"Peneliti",
			"Pranata Komputer",
			"Arsiparis",
			"Pustakawan",
			"Dokter",
			"Guru",
		],
	},
	{
		name: "Jabatan Fungsional Penunjang",
		description: "Widyaiswara, Pengelola Pengadaan, Analis Kebijakan",
		kelompok: [
			"Widyaiswara",
			"Pengelola Pengadaan",
			"Analis Kebijakan",
		],
	},
	{
		name: "Jabatan Fungsional Khusus",
		description: "PPNS, Pranata Lab, Ahli Statistik, Ahli Meteorologi",
		kelompok: [
			"PPNS",
			"Pranata Laboratorium",
			"Ahli Statistik",
			"Ahli Meteorologi",
		],
	},
];

async function main() {
	console.log("[seed-jabatan] starting...");

	for (const jab of JABATAN) {
		try {
			const existing = await prisma.m_jabatan.findFirst({
				where: { name: jab.name },
			});

			if (existing) {
				await prisma.m_jabatan.update({
					where: { id: existing.id },
					data: {
						description: jab.description,
						kelompok: jab.kelompok,
						updated_at: new Date(),
					},
				});
				console.log(`[seed-jabatan] updated ${jab.name}`);
			} else {
				await prisma.m_jabatan.create({
					data: {
						name: jab.name,
						description: jab.description,
						kelompok: jab.kelompok,
						instansi_id: null, // sementara null
					},
				});
				console.log(`[seed-jabatan] created ${jab.name}`);
			}

		} catch (e: any) {
			console.error(`[seed-jabatan] failed for ${jab.name}:`, e?.message || e);
		}
	}

	console.log("[seed-jabatan] done");
}

main()
	.catch((e) => {
		console.error("[seed-jabatan] error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
