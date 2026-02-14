import { PrismaService } from '../prisma/prisma.service';
export declare class ProblemsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        language: string;
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
        language: string;
    }>;
    findOneInternal(id: string): Promise<{
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
    }>;
}
