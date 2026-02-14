export declare const findActiveUsers: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    isMultiFile: boolean;
    language: string;
    questionType: string;
    setupSQL: string;
    boilerplateCode: string;
    solutionTemplate: string;
    templateFiles: never[];
    testCases: {
        id: number;
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }[];
    examples: {
        input: string;
        output: string;
        explanation: string;
    }[];
    constraints: string[];
};
