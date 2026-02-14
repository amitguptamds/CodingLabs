/**
 * Prisma Seed Script
 * Populates the database with problems and a default test candidate.
 *
 * Run: npx ts-node prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as path from 'path';
import { problems } from './problems';

const dbPath = path.join(process.cwd(), 'dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...\n');

    // --- Default test candidate ---
    const candidate = await prisma.candidate.upsert({
        where: { email: 'test@codearena.dev' },
        update: {},
        create: {
            id: 'default-candidate',
            email: 'test@codearena.dev',
            name: 'Test Candidate',
            token: 'test-token-123',
        },
    });
    console.log(`✅ Candidate: ${candidate.name} (${candidate.email})`);

    // --- Problems ---
    for (const p of problems) {
        await prisma.problem.upsert({
            where: { id: p.id },
            update: p,
            create: p,
        });
        console.log(`✅ Problem: ${p.title} (${p.id}) — ${p.testCases.length} test cases`);
    }

    console.log('\n🎉 Seed complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
