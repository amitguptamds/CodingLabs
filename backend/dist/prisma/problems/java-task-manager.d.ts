export declare const javaTaskManager: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    tags: string[];
    isMultiFile: boolean;
    language: string;
    boilerplateCode: string;
    solutionTemplate: string;
    templateFiles: {
        name: string;
        path: string;
        language: string;
        content: string;
    }[];
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
