import { ProblemsService } from './problems.service';
export declare class ProblemsController {
    private readonly problemsService;
    constructor(problemsService: ProblemsService);
    findAll(): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
}
