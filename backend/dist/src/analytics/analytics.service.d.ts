import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    recordAttempt(data: {
        sessionId: string;
        problemId: string;
        language: string;
    }): Promise<{
        id: string;
        language: string;
        problemId: string;
        status: string;
        sessionId: string;
        reloadCount: number;
        sessionStartedAt: Date;
        lastActiveAt: Date;
    }>;
    recordTestCaseRun(data: {
        sessionId: string;
        problemId: string;
        testCaseResults: any[];
        passed: number;
        total: number;
        allPassed: boolean;
        userCode: string;
        executionTimeMs?: number;
    }): Promise<{
        id: string;
        passed: number;
        total: number;
        allPassed: boolean;
        attemptId: string;
        runNumber: number;
        testCaseResults: import("@prisma/client/runtime/client").JsonValue;
        userCode: string;
        executionTimeMs: number | null;
        ranAt: Date;
    }>;
    getAttempt(sessionId: string, problemId: string): Promise<({
        problem: {
            title: string;
            difficulty: string;
            language: string;
            problemType: string;
        };
        testCaseRuns: {
            id: string;
            passed: number;
            total: number;
            allPassed: boolean;
            attemptId: string;
            runNumber: number;
            testCaseResults: import("@prisma/client/runtime/client").JsonValue;
            userCode: string;
            executionTimeMs: number | null;
            ranAt: Date;
        }[];
    } & {
        id: string;
        language: string;
        problemId: string;
        status: string;
        sessionId: string;
        reloadCount: number;
        sessionStartedAt: Date;
        lastActiveAt: Date;
    }) | null>;
    getProblemStats(problemId: string): Promise<{
        problemId: string;
        totalAttempts: number;
        successfulAttempts: number;
        successRate: number;
        totalTestRuns: number;
        averageReloads: number;
    }>;
    getSessionAttempts(sessionId: string): Promise<({
        problem: {
            title: string;
            difficulty: string;
            language: string;
            problemType: string;
        };
        testCaseRuns: {
            id: string;
            passed: number;
            total: number;
            allPassed: boolean;
            attemptId: string;
            runNumber: number;
            testCaseResults: import("@prisma/client/runtime/client").JsonValue;
            userCode: string;
            executionTimeMs: number | null;
            ranAt: Date;
        }[];
    } & {
        id: string;
        language: string;
        problemId: string;
        status: string;
        sessionId: string;
        reloadCount: number;
        sessionStartedAt: Date;
        lastActiveAt: Date;
    })[]>;
}
