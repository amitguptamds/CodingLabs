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
    getLanguageId(language: string): number;
    getEntryPoint(language: string): string;
    executeCode(files: ProjectFile[], entryPoint: string, testCases: TestCase[], language?: string): Promise<TestResult[]>;
    private buildFullSource;
    private buildJavaScriptSource;
    private buildPythonSource;
    private buildJavaSource;
    private buildCppSource;
    private buildTypeScriptSource;
    private buildGoSource;
    private buildRustSource;
    private jsTaskManagerScenario;
    private pythonTaskManagerScenario;
    private javaTaskManagerScenario;
    private cppTaskManagerScenario;
    private tsTaskManagerScenario;
    private goTaskManagerScenario;
    private rustTaskManagerScenario;
    private eventEmitterScenario;
    private greetingSystemScenario;
    private todoAppScenario;
    private userApiScenario;
    private extractFunctionName;
    private cleanCode;
    private compareOutputs;
    private pollResults;
    private sleep;
}
