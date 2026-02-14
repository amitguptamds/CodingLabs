import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceService, ProjectFile } from '../workspace/workspace.service';
import { Judge0Service, TestCase, TestResult } from '../judge0/judge0.service';
import { ProblemsService } from '../problems/problems.service';

@Injectable()
export class SessionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly workspaceService: WorkspaceService,
        private readonly judge0Service: Judge0Service,
        private readonly problemsService: ProblemsService,
    ) { }

    /**
     * Create a new session: initialize S3 workspace from template.
     */
    async create(candidateId: string, problemId: string) {
        // Ensure the candidate exists (upsert for development)
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
        const templateFiles = problem.templateFiles as unknown as ProjectFile[];

        // Check if session already exists (resume)
        const existing = await this.prisma.session.findUnique({
            where: {
                candidateId_problemId: { candidateId, problemId },
            },
        });

        if (existing) {
            const files = await this.workspaceService.getWorkspaceFiles(
                existing.workspacePath,
            );
            return { session: existing, files };
        }

        // Initialize S3 workspace
        const workspacePath = await this.workspaceService.initWorkspace(
            candidateId,
            problemId,
            templateFiles,
        );

        // Create session record
        const session = await this.prisma.session.create({
            data: {
                candidateId,
                problemId,
                workspacePath,
            },
        });

        return { session, files: templateFiles };
    }

    /**
     * Create a session from an external application.
     * The external app supplies its own sessionId, questionId, and candidateId.
     * Workspace is isolated at sessions/{sessionId}/.
     */
    async createExternal(sessionId: string, questionId: string, candidateId: string) {
        // Ensure the candidate exists (upsert)
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
        const templateFiles = problem.templateFiles as unknown as ProjectFile[];

        // Check if session already exists (resume)
        const existing = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (existing) {
            const files = await this.workspaceService.getWorkspaceFiles(
                existing.workspacePath,
            );
            // Return problem metadata for the frontend
            const problemData = await this.problemsService.findOne(questionId);
            return { session: existing, files, problem: problemData };
        }

        // Initialize workspace isolated by sessionId
        const workspacePath = `sessions/${sessionId}`;
        const fullPath = require('path').join(
            process.cwd(), 'workspaces', workspacePath,
        );
        require('fs').mkdirSync(fullPath, { recursive: true });

        for (const file of templateFiles) {
            const filePath = require('path').join(fullPath, file.path);
            require('fs').mkdirSync(require('path').dirname(filePath), { recursive: true });
            require('fs').writeFileSync(filePath, file.content, 'utf-8');
        }

        // Create session record with caller-supplied ID
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

    /**
     * Get session with workspace files.
     */
    async findOne(id: string) {
        const session = await this.prisma.session.findUnique({
            where: { id },
            include: { problem: true },
        });
        if (!session) {
            throw new NotFoundException(`Session '${id}' not found`);
        }

        const files = await this.workspaceService.getWorkspaceFiles(
            session.workspacePath,
        );

        return { session, files };
    }

    /**
     * Save a file to the S3 workspace.
     */
    async saveFile(sessionId: string, filename: string, content: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new NotFoundException(`Session '${sessionId}' not found`);
        }

        // Find the correct file path in the workspace
        const files = await this.workspaceService.getWorkspaceFiles(
            session.workspacePath,
        );
        const file = files.find((f) => f.name === filename);
        const filePath = file ? file.path : `src/${filename}`;

        await this.workspaceService.saveFile(
            session.workspacePath,
            filePath,
            content,
        );

        return { success: true, filename };
    }

    /**
     * Submit code: read files from S3, send to Judge0, store results.
     */
    async submit(sessionId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
        });
        if (!session) {
            throw new NotFoundException(`Session '${sessionId}' not found`);
        }

        // Get ALL test cases (including hidden) for execution
        const problem = await this.problemsService.findOneInternal(
            session.problemId,
        );
        const testCases = problem.testCases as unknown as TestCase[];

        // Determine entry point
        const isMultiFile = problem.isMultiFile;

        // For multi-file problems, prefer the code-server workspace
        // (where the user actually edits files) over the session workspace
        let files: ProjectFile[];
        if (isMultiFile) {
            const csFiles = await this.workspaceService.getCodeServerFiles(
                session.problemId,
            );
            files = csFiles ?? await this.workspaceService.getWorkspaceFiles(
                session.workspacePath,
            );
        } else {
            files = await this.workspaceService.getWorkspaceFiles(
                session.workspacePath,
            );
        }

        const entryPoint = isMultiFile ? 'index.js' : files[0]?.name || 'solution.js';

        // Execute via Judge0
        const results = await this.judge0Service.executeCode(
            files,
            entryPoint,
            testCases,
        );

        const passed = results.filter((r) => r.passed).length;
        const total = results.length;

        // Store submission
        const submission = await this.prisma.submission.create({
            data: {
                sessionId,
                files: files as any,
                results: results as any,
                passed,
                total,
                allPassed: passed === total,
            },
        });

        // Update session status if all passed
        if (passed === total) {
            await this.prisma.session.update({
                where: { id: sessionId },
                data: { status: 'submitted', submittedAt: new Date() },
            });
        }

        // Return results with hidden test case details stripped
        const sanitizedResults = results.map((r) => ({
            ...r,
            testCase: r.testCase.isHidden
                ? { id: r.testCase.id, isHidden: true, input: '', expectedOutput: '' }
                : r.testCase,
            // Hide actual output for hidden tests that failed
            actualOutput:
                r.testCase.isHidden && !r.passed ? 'Hidden' : r.actualOutput,
        }));

        return {
            submissionId: submission.id,
            passed,
            total,
            allPassed: passed === total,
            results: sanitizedResults,
        };
    }

    /**
     * Get the latest submission results for a session.
     */
    async getLatestResults(sessionId: string) {
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
}
