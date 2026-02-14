"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordAttempt(data) {
        const existing = await this.prisma.questionAttempt.findUnique({
            where: {
                sessionId_problemId: {
                    sessionId: data.sessionId,
                    problemId: data.problemId,
                },
            },
        });
        if (existing) {
            return this.prisma.questionAttempt.update({
                where: { id: existing.id },
                data: { reloadCount: existing.reloadCount + 1 },
            });
        }
        return this.prisma.questionAttempt.create({
            data: {
                sessionId: data.sessionId,
                problemId: data.problemId,
                language: data.language,
                status: 'active',
            },
        });
    }
    async recordTestCaseRun(data) {
        let attempt = await this.prisma.questionAttempt.findUnique({
            where: {
                sessionId_problemId: {
                    sessionId: data.sessionId,
                    problemId: data.problemId,
                },
            },
        });
        if (!attempt) {
            attempt = await this.prisma.questionAttempt.create({
                data: {
                    sessionId: data.sessionId,
                    problemId: data.problemId,
                    language: 'unknown',
                    status: 'active',
                },
            });
        }
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
        if (data.allPassed) {
            await this.prisma.questionAttempt.update({
                where: { id: attempt.id },
                data: { status: 'submitted' },
            });
        }
        return run;
    }
    async getAttempt(sessionId, problemId) {
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
    async getProblemStats(problemId) {
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
    async getSessionAttempts(sessionId) {
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
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map