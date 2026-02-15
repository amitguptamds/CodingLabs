import { AnalyticsService } from './analytics.service';
declare class RecordAttemptDto {
    sessionId: string;
    problemId: string;
    language: string;
}
declare class RecordTestCaseRunDto {
    sessionId: string;
    problemId: string;
    testCaseResults: any[];
    passed: number;
    total: number;
    allPassed: boolean;
    userCode: string;
    executionTimeMs?: number;
}
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    recordAttempt(dto: RecordAttemptDto): Promise<{
        id: string;
        language: string;
        problemId: string;
        status: string;
        sessionId: string;
        reloadCount: number;
        sessionStartedAt: Date;
        lastActiveAt: Date;
    }>;
    recordTestCaseRun(dto: RecordTestCaseRunDto): Promise<{
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
export {};
