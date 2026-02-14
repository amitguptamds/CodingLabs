/**
 * Prisma Seed Script
 * Populates the database with problems and a default test candidate.
 *
 * Run: npx ts-node prisma/seed.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { problems } from './problems';

const connectionString = process.env['DATABASE_URL'] || 'postgresql://codearena:codearena@localhost:5432/codearena';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Derive problemType from the problem's properties.
 */
function deriveProblemType(p: any): string {
    if (p.questionType === 'sql') return 'sql';
    if (p.questionType === 'nosql') return 'nosql';
    if (p.isMultiFile) return 'multiFile';
    return 'singleFile';
}

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
        const problemType = deriveProblemType(p);
        const data = { ...p, problemType };
        await prisma.problem.upsert({
            where: { id: p.id },
            update: data,
            create: data,
        });
        console.log(`✅ Problem: ${p.title} (${p.id}) — ${p.testCases.length} test cases [${problemType}]`);
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
