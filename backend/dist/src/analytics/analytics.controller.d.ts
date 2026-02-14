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
        sessionId: string;
        problemId: string;
        language: string;
        reloadCount: number;
        sessionStartedAt: Date;
        lastActiveAt: Date;
        status: string;
    }>;
    recordTestCaseRun(dto: RecordTestCaseRunDto): Promise<{
        id: string;
        runNumber: number;
        testCaseResults: import("@prisma/client/runtime/client").JsonValue;
        passed: number;
        total: number;
        allPassed: boolean;
        userCode: string;
        executionTimeMs: number | null;
        ranAt: Date;
        attemptId: string;
    }>;
    getAttempt(sessionId: string, problemId: string): Promise<({
        problem: {
            language: string;
            title: string;
            difficulty: string;
            problemType: string;
        };
        testCaseRuns: {
            id: string;
            runNumber: number;
            testCaseResults: import("@prisma/client/runtime/client").JsonValue;
            passed: number;
            total: number;
            allPassed: boolean;
            userCode: string;
            executionTimeMs: number | null;
            ranAt: Date;
            attemptId: string;
        }[];
    } & {
        id: string;
        sessionId: string;
        problemId: string;
        language: string;
        reloadCount: number;
        sessionStartedAt: Date;
        lastActiveAt: Date;
        status: string;
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
            language: string;
            title: string;
            difficulty: string;
            problemType: string;
        };
        testCaseRuns: {
            id: string;
            runNumber: number;
            testCaseResults: import("@prisma/client/runtime/client").JsonValue;
            passed: number;
            total: number;
            allPassed: boolean;
            userCode: string;
            executionTimeMs: number | null;
            ranAt: Date;
            attemptId: string;
        }[];
    } & {
        id: string;
        sessionId: string;
        problemId: string;
        language: string;
        reloadCount: number;
        sessionStartedAt: Date;
        lastActiveAt: Date;
        status: string;
    })[]>;
}
export {};
