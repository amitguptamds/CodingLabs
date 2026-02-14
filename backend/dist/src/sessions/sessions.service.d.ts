import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceService, ProjectFile } from '../workspace/workspace.service';
import { Judge0Service, TestCase } from '../judge0/judge0.service';
import { ProblemsService } from '../problems/problems.service';
export declare class SessionsService {
    private readonly prisma;
    private readonly workspaceService;
    private readonly judge0Service;
    private readonly problemsService;
    constructor(prisma: PrismaService, workspaceService: WorkspaceService, judge0Service: Judge0Service, problemsService: ProblemsService);
    create(candidateId: string, problemId: string): Promise<{
        session: {
            id: string;
            candidateId: string;
            problemId: string;
            status: string;
            workspacePath: string;
            startedAt: Date;
            submittedAt: Date | null;
        };
        files: ProjectFile[];
    }>;
    createExternal(sessionId: string, questionId: string, candidateId: string): Promise<{
        session: {
            id: string;
            candidateId: string;
            problemId: string;
            status: string;
            workspacePath: string;
            startedAt: Date;
            submittedAt: Date | null;
        };
        files: ProjectFile[];
        problem: {
            testCases: any[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string;
            difficulty: string;
            tags: import("@prisma/client/runtime/client").JsonValue;
            isMultiFile: boolean;
            templateFiles: import("@prisma/client/runtime/client").JsonValue;
            examples: import("@prisma/client/runtime/client").JsonValue;
            constraints: import("@prisma/client/runtime/client").JsonValue;
            boilerplateCode: string;
            solutionTemplate: string;
            language: string;
            questionType: string;
            setupSQL: string | null;
            problemType: string;
        };
    }>;
    findOne(id: string): Promise<{
        session: {
            problem: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                description: string;
                difficulty: string;
                tags: import("@prisma/client/runtime/client").JsonValue;
                isMultiFile: boolean;
                templateFiles: import("@prisma/client/runtime/client").JsonValue;
                testCases: import("@prisma/client/runtime/client").JsonValue;
                examples: import("@prisma/client/runtime/client").JsonValue;
                constraints: import("@prisma/client/runtime/client").JsonValue;
                boilerplateCode: string;
                solutionTemplate: string;
                language: string;
                questionType: string;
                setupSQL: string | null;
                problemType: string;
            };
        } & {
            id: string;
            candidateId: string;
            problemId: string;
            status: string;
            workspacePath: string;
            startedAt: Date;
            submittedAt: Date | null;
        };
        files: ProjectFile[];
    }>;
    saveFile(sessionId: string, filename: string, content: string): Promise<{
        success: boolean;
        filename: string;
    }>;
    submit(sessionId: string): Promise<{
        submissionId: string;
        passed: number;
        total: number;
        allPassed: boolean;
        results: {
            testCase: TestCase;
            actualOutput: string;
            passed: boolean;
            error?: string;
            executionTime?: number;
        }[];
    }>;
    getLatestResults(sessionId: string): Promise<{
        results: never[];
        passed: number;
        total: number;
        submissionId?: undefined;
        allPassed?: undefined;
    } | {
        submissionId: string;
        passed: number;
        total: number;
        allPassed: boolean;
        results: import("@prisma/client/runtime/client").JsonValue;
    }>;
}
