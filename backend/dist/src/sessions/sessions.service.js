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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const workspace_service_1 = require("../workspace/workspace.service");
const judge0_service_1 = require("../judge0/judge0.service");
const problems_service_1 = require("../problems/problems.service");
let SessionsService = class SessionsService {
    prisma;
    workspaceService;
    judge0Service;
    problemsService;
    constructor(prisma, workspaceService, judge0Service, problemsService) {
        this.prisma = prisma;
        this.workspaceService = workspaceService;
        this.judge0Service = judge0Service;
        this.problemsService = problemsService;
    }
    async create(candidateId, problemId) {
        await this.prisma.candidate.upsert({
            where: { id: candidateId },
            update: {},
            create: {
                id: candidateId,
                email: `${candidateId}@codearena.dev`,
                name: candidateId,
                token: candidateId,
            },
        });
        const problem = await this.problemsService.findOneInternal(problemId);
        const templateFiles = problem.templateFiles;
        const existing = await this.prisma.session.findUnique({
            where: {
                candidateId_problemId: { candidateId, problemId },
            },
        });
        if (existing) {
            const files = await this.workspaceService.getWorkspaceFiles(existing.workspacePath);
            return { session: existing, files };
        }
        const workspacePath = await this.workspaceService.initWorkspace(candidateId, problemId, templateFiles);
        const session = await this.prisma.session.create({
            data: {
                candidateId,
                problemId,
                workspacePath,
            },
        });
        return { session, files: templateFiles };
    }
    async createExternal(sessionId, questionId, candidateId) {
        await this.prisma.candidate.upsert({
            where: { id: candidateId },
            update: {},
            create: {
                id: candidateId,
                email: `${candidateId}@codearena.dev`,
                name: candidateId,
                token: candidateId,
            },
        });
        const problem = await this.problemsService.findOneInternal(questionId);
        const templateFiles = problem.templateFiles;
        const existing = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (existing) {
            const files = await this.workspaceService.getWorkspaceFiles(existing.workspacePath);
            const problemData = await this.problemsService.findOne(questionId);
            return { session: existing, files, problem: problemData };
        }
        const workspacePath = `sessions/${sessionId}`;
        const fullPath = require('path').join(process.cwd(), 'workspaces', workspacePath);
        require('fs').mkdirSync(fullPath, { recursive: true });
        for (const file of templateFiles) {
            const filePath = require('path').join(fullPath, file.path);
            require('fs').mkdirSync(require('path').dirname(filePath), { recursive: true });
            require('fs').writeFileSync(filePath, file.content, 'utf-8');
        }
        const session = await this.prisma.session.create({
            data: {
                id: sessionId,
                candidateId,
                problemId: questionId,
                workspacePath,
            },
        });
        const problemData = await this.problemsService.findOne(questionId);
        return { session, files: templateFiles, problem: problemData };
    }
    async findOne(id) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: { problem: true },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Session '${id}' not found`);
        }
        const files = await this.workspaceService.getWorkspaceFiles(session.workspacePath);
        return { session, files };
    }
    async saveFile(sessionId, filename, content) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Session '${sessionId}' not found`);
        }
        const files = await this.workspaceService.getWorkspaceFiles(session.workspacePath);
        const file = files.find((f) => f.name === filename);
        const filePath = file ? file.path : `src/${filename}`;
        await this.workspaceService.saveFile(session.workspacePath, filePath, content);
        return { success: true, filename };
    }
    async submit(sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new common_1.NotFoundException(`Session '${sessionId}' not found`);
        }
        const problem = await this.problemsService.findOneInternal(session.problemId);
        const testCases = problem.testCases;
        const isMultiFile = problem.isMultiFile;
        let files;
        if (isMultiFile) {
            const csFiles = await this.workspaceService.getCodeServerFiles(session.problemId);
            files = csFiles ?? await this.workspaceService.getWorkspaceFiles(session.workspacePath);
        }
        else {
            files = await this.workspaceService.getWorkspaceFiles(session.workspacePath);
        }
        const entryPoint = isMultiFile ? 'index.js' : files[0]?.name || 'solution.js';
        const results = await this.judge0Service.executeCode(files, entryPoint, testCases);
        const passed = results.filter((r) => r.passed).length;
        const total = results.length;
        const submission = await this.prisma.submission.create({
            data: {
                sessionId,
                files: files,
                results: results,
                passed,
                total,
                allPassed: passed === total,
            },
        });
        if (passed === total) {
            await this.prisma.session.update({
                where: { id: sessionId },
                data: { status: 'submitted', submittedAt: new Date() },
            });
        }
        const sanitizedResults = results.map((r) => ({
            ...r,
            testCase: r.testCase.isHidden
                ? { id: r.testCase.id, isHidden: true, input: '', expectedOutput: '' }
                : r.testCase,
            actualOutput: r.testCase.isHidden && !r.passed ? 'Hidden' : r.actualOutput,
        }));
        return {
            submissionId: submission.id,
            passed,
            total,
            allPassed: passed === total,
            results: sanitizedResults,
        };
    }
    async getLatestResults(sessionId) {
        const submission = await this.prisma.submission.findFirst({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
        });
        if (!submission) {
            return { results: [], passed: 0, total: 0 };
        }
        return {
            submissionId: submission.id,
            passed: submission.passed,
            total: submission.total,
            allPassed: submission.allPassed,
            results: submission.results,
        };
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        workspace_service_1.WorkspaceService,
        judge0_service_1.Judge0Service,
        problems_service_1.ProblemsService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map