import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Record or update a question attempt for a session.
     * If an attempt already exists for this session + problem, increment reloadCount.
     */
    async recordAttempt(data: {
        sessionId: string;
        problemId: string;
        language: string;
    }) {
        const existing = await this.prisma.questionAttempt.findUnique({
            where: {
                sessionId_problemId: {
                    sessionId: data.sessionId,
                    problemId: data.problemId,
                },
            },
        });

        if (existing) {
            // Increment reload count
            return this.prisma.questionAttempt.update({
                where: { id: existing.id },
                data: { reloadCount: existing.reloadCount + 1 },
            });
        }

        // Create new attempt
        return this.prisma.questionAttempt.create({
            data: {
                sessionId: data.sessionId,
                problemId: data.problemId,
                language: data.language,
                status: 'active',
            },
        });
    }

    /**
     * Record a test case run within an attempt.
     */
    async recordTestCaseRun(data: {
        sessionId: string;
        problemId: string;
        testCaseResults: any[];
        passed: number;
        total: number;
        allPassed: boolean;
        userCode: string;
        executionTimeMs?: number;
    }) {
        // Find or create the attempt
        let attempt = await this.prisma.questionAttempt.findUnique({
            where: {
                sessionId_problemId: {
                    sessionId: data.sessionId,
                    problemId: data.problemId,
                },
            },
        });

        if (!attempt) {
            // Auto-create attempt if it doesn't exist yet
            attempt = await this.prisma.questionAttempt.create({
                data: {
                    sessionId: data.sessionId,
                    problemId: data.problemId,
                    language: 'unknown',
                    status: 'active',
                },
            });
        }

        // Count existing runs to determine run number
        const runCount = await this.prisma.testCaseRun.count({
            where: { attemptId: attempt.id },
        });

        const run = await this.prisma.testCaseRun.create({
            data: {
                attemptId: attempt.id,
                runNumber: runCount + 1,
                testCaseResults: data.testCaseResults,
                passed: data.passed,
                total: data.total,
                allPassed: data.allPassed,
                userCode: data.userCode,
                executionTimeMs: data.executionTimeMs ?? null,
            },
        });

        // Update attempt status if all passed
        if (data.allPassed) {
            await this.prisma.questionAttempt.update({
                where: { id: attempt.id },
                data: { status: 'submitted' },
            });
        }

        return run;
    }

    /**
     * Get attempt details for a session + problem.
     */
    async getAttempt(sessionId: string, problemId: string) {
        return this.prisma.questionAttempt.findUnique({
            where: {
                sessionId_problemId: { sessionId, problemId },
            },
            include: {
                testCaseRuns: {
                    orderBy: { runNumber: 'asc' },
                },
                problem: {
                    select: {
                        title: true,
                        language: true,
                        difficulty: true,
                        problemType: true,
                    },
                },
            },
        });
    }

    /**
     * Get aggregate stats for a problem.
     */
    async getProblemStats(problemId: string) {
        const [totalAttempts, totalRuns, successfulAttempts] = await Promise.all([
            this.prisma.questionAttempt.count({ where: { problemId } }),
            this.prisma.testCaseRun.count({
                where: { attempt: { problemId } },
            }),
            this.prisma.questionAttempt.count({
                where: { problemId, status: 'submitted' },
            }),
        ]);

        const avgReloads = await this.prisma.questionAttempt.aggregate({
            where: { problemId },
            _avg: { reloadCount: true },
        });

        return {
            problemId,
            totalAttempts,
            successfulAttempts,
            successRate: totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0,
            totalTestRuns: totalRuns,
            averageReloads: avgReloads._avg.reloadCount ?? 0,
        };
    }

    /**
     * Get all attempts for a session.
     */
    async getSessionAttempts(sessionId: string) {
        return this.prisma.questionAttempt.findMany({
            where: { sessionId },
            include: {
                problem: {
                    select: {
                        title: true,
                        language: true,
                        difficulty: true,
                        problemType: true,
                    },
                },
                testCaseRuns: {
                    orderBy: { runNumber: 'asc' },
                },
            },
            orderBy: { sessionStartedAt: 'asc' },
        });
    }
}
