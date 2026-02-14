import { SessionsService } from './sessions.service';
import { CreateSessionDto, SaveFileDto, ExternalSessionDto } from './dto/session.dto';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    create(dto: CreateSessionDto, req: any): Promise<{
        session: {
            id: string;
            candidateId: string;
            problemId: string;
            status: string;
            workspacePath: string;
            startedAt: Date;
            submittedAt: Date | null;
        };
        files: import("../workspace/workspace.service").ProjectFile[];
    }>;
    createExternal(dto: ExternalSessionDto): Promise<{
        session: {
            id: string;
            candidateId: string;
            problemId: string;
            status: string;
            workspacePath: string;
            startedAt: Date;
            submittedAt: Date | null;
        };
        files: import("../workspace/workspace.service").ProjectFile[];
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
        files: import("../workspace/workspace.service").ProjectFile[];
    }>;
    saveFile(sessionId: string, filename: string, dto: SaveFileDto): Promise<{
        success: boolean;
        filename: string;
    }>;
    submit(sessionId: string): Promise<{
        submissionId: string;
        passed: number;
        total: number;
        allPassed: boolean;
        results: {
            testCase: import("../judge0/judge0.service").TestCase;
            actualOutput: string;
            passed: boolean;
            error?: string;
            executionTime?: number;
        }[];
    }>;
    getResults(sessionId: string): Promise<{
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
