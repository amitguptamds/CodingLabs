"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const problems_1 = require("./problems");
const connectionString = process.env['DATABASE_URL'] || 'postgresql://codearena:codearena@localhost:5432/codearena';
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
function deriveProblemType(p) {
    if (p.questionType === 'sql')
        return 'sql';
    if (p.questionType === 'nosql')
        return 'nosql';
    if (p.isMultiFile)
        return 'multiFile';
    return 'singleFile';
}
async function main() {
    console.log('🌱 Seeding database...\n');
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
    for (const p of problems_1.problems) {
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
//# sourceMappingURL=seed.js.map