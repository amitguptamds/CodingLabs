export interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface TestResult {
    testCase: TestCase;
    passed: boolean;
    actualOutput: string;
    error?: string;
    executionTime?: number;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ProjectFile {
    name: string;
    path: string;
    language: string;
    content: string;
    isReadOnly?: boolean;
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    tags: string[];
    boilerplateCode: string;
    solutionTemplate: string;
    testCases: TestCase[];
    examples: ProblemExample[];
    constraints: string[];
    isMultiFile?: boolean;
    language?: string;
    files?: ProjectFile[];
    questionType?: 'code' | 'sql';
    setupSQL?: string;
    validationQuery?: string;
}

export interface ProblemExample {
    input: string;
    output: string;
    explanation?: string;
}
