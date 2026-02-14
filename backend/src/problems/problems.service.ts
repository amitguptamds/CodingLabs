import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProblemsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        const problems = await this.prisma.problem.findMany({
            orderBy: { createdAt: 'asc' },
        });

        // Strip hidden test cases from response
        return problems.map((p) => ({
            ...p,
            testCases: (p.testCases as any[]).map((tc) =>
                tc.isHidden
                    ? { id: tc.id, isHidden: true, input: '', expectedOutput: '' }
                    : tc,
            ),
        }));
    }

    async findOne(id: string) {
        const problem = await this.prisma.problem.findUnique({ where: { id } });
        if (!problem) {
            throw new NotFoundException(`Problem '${id}' not found`);
        }

        return {
            ...problem,
            testCases: (problem.testCases as any[]).map((tc) =>
                tc.isHidden
                    ? { id: tc.id, isHidden: true, input: '', expectedOutput: '' }
                    : tc,
            ),
        };
    }

    /**
     * Internal method — returns problem with ALL test cases (including hidden).
     * Used by the submission service for Judge0 execution.
     */
    async findOneInternal(id: string) {
        const problem = await this.prisma.problem.findUnique({ where: { id } });
        if (!problem) {
            throw new NotFoundException(`Problem '${id}' not found`);
        }
        return problem;
    }
}
