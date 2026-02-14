import { ConfigService } from '@nestjs/config';
import { ProjectFile } from '../workspace/workspace.service';
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
export declare class Judge0Service {
    private readonly config;
    private readonly client;
    private readonly logger;
    constructor(config: ConfigService);
    executeCode(files: ProjectFile[], entryPoint: string, testCases: TestCase[]): Promise<TestResult[]>;
    private pollResults;
    private cleanCode;
    private compareOutputs;
    private buildScenarioTestScript;
    private eventEmitterScenario;
    private greetingSystemScenario;
    private todoAppScenario;
    private userApiScenario;
    private sleep;
}
