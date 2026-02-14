import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
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

interface Judge0Submission {
    language_id: number;
    source_code: string;
    stdin: string;
    expected_output: string;
    cpu_time_limit: number;
    memory_limit: number;
    wall_time_limit: number;
}

interface Judge0Result {
    stdout: string | null;
    stderr: string | null;
    status: { id: number; description: string };
    time: string;
    memory: number;
}

@Injectable()
export class Judge0Service {
    private readonly client: AxiosInstance;
    private readonly logger = new Logger(Judge0Service.name);

    constructor(private readonly config: ConfigService) {
        const rapidApiKey = this.config.get<string>('RAPIDAPI_KEY', '');
        const rapidApiHost = this.config.get<string>(
            'RAPIDAPI_HOST',
            'judge0-ce.p.rapidapi.com',
        );

        this.client = axios.create({
            baseURL: `https://${rapidApiHost}`,
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': rapidApiHost,
            },
        });
    }

    /**
     * Submit code for all test cases and return results.
     * Each test case becomes a separate Judge0 submission with its own
     * scenario test harness wrapping the user's code.
     */
    async executeCode(
        files: ProjectFile[],
        entryPoint: string,
        testCases: TestCase[],
    ): Promise<TestResult[]> {
        // Build combined source code
        const entryFile = files.find((f) => f.name === entryPoint);
        const otherFiles = files.filter((f) => f.name !== entryPoint);

        const combinedCode = [
            ...otherFiles.map((f) => this.cleanCode(f.content)),
            entryFile ? this.cleanCode(entryFile.content) : '',
        ].join('\n\n');

        // Identify function name from entry point
        const functionMatch = entryFile?.content.match(/function\s+(\w+)/);
        const functionName = functionMatch ? functionMatch[1] : '';

        // Build Judge0 submissions
        const submissions: Judge0Submission[] = testCases.map((tc) => {
            const parsedInput = JSON.parse(tc.input);
            const testScript = this.buildScenarioTestScript(functionName, parsedInput);

            // Wrap code to output result as JSON to stdout
            const fullSource = `
${combinedCode}

// --- Test Harness ---
const __result = (() => {
  ${testScript}
})();
console.log(JSON.stringify(__result));
`;

            return {
                language_id: 63, // Node.js
                source_code: Buffer.from(fullSource).toString('base64'),
                stdin: '',
                expected_output: Buffer.from(tc.expectedOutput).toString('base64'),
                cpu_time_limit: 5,
                memory_limit: 128000,
                wall_time_limit: 10,
            };
        });

        // Submit batch to Judge0
        const { data: tokenData } = await this.client.post(
            '/submissions/batch?base64_encoded=true&wait=false',
            { submissions },
        );

        const tokens: string[] = tokenData.map((t: { token: string }) => t.token);

        // Poll for results
        const results = await this.pollResults(tokens);

        // Map Judge0 results to TestResult objects
        return results.map((result, i) => {
            const tc = testCases[i];
            const stdout = result.stdout
                ? Buffer.from(result.stdout, 'base64').toString('utf-8').trim()
                : '';
            const stderr = result.stderr
                ? Buffer.from(result.stderr, 'base64').toString('utf-8')
                : '';
            const statusId = result.status?.id ?? 0;

            // Status 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit, 6 = Compilation Error, etc.
            const isAccepted = statusId === 3;

            let passed = false;
            if (isAccepted) {
                passed = this.compareOutputs(stdout, tc.expectedOutput);
            }

            return {
                testCase: tc,
                passed,
                actualOutput: isAccepted ? stdout : `Error: ${result.status?.description || 'Unknown'}`,
                error: stderr || (statusId > 3 ? result.status?.description : undefined),
                executionTime: result.time ? parseFloat(result.time) * 1000 : undefined,
            };
        });
    }

    /**
     * Poll Judge0 for batch results until all are complete.
     */
    private async pollResults(
        tokens: string[],
        maxAttempts = 30,
        intervalMs = 1000,
    ): Promise<Judge0Result[]> {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const { data } = await this.client.get(
                `/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=true&fields=stdout,stderr,status,time,memory`,
            );

            const submissions: Judge0Result[] = data.submissions;
            const allDone = submissions.every(
                (s) => s.status && s.status.id >= 3, // 1=In Queue, 2=Processing, 3+=Done
            );

            if (allDone) {
                return submissions;
            }

            await this.sleep(intervalMs);
        }

        this.logger.warn('Judge0 polling timed out');
        return tokens.map(() => ({
            stdout: null,
            stderr: 'Execution timed out',
            status: { id: 5, description: 'Time Limit Exceeded' },
            time: '0',
            memory: 0,
        }));
    }

    /**
     * Strip require/import/export for sandboxed execution.
     */
    private cleanCode(code: string): string {
        return code
            .replace(/^(?:const|let|var)\s+\{[^}]+\}\s*=\s*require\([^)]+\);?\s*$/gm, '')
            .replace(/^(?:const|let|var)\s+\w+\s*=\s*require\([^)]+\);?\s*$/gm, '')
            .replace(/^module\.exports\s*=\s*\{[^}]*\};?\s*$/gm, '')
            .replace(/^module\.exports\s*=\s*\w+;?\s*$/gm, '')
            .replace(/^export\s+/gm, '')
            .replace(/^import\s+.*$/gm, '');
    }

    private compareOutputs(actual: string, expected: string): boolean {
        try {
            const actualParsed = JSON.parse(actual);
            const expectedParsed = JSON.parse(expected);
            return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
        } catch {
            return actual.trim() === expected.trim();
        }
    }

    // ── Scenario Test Harnesses (migrated from frontend) ──

    private buildScenarioTestScript(
        functionName: string,
        parsedInput: any[],
    ): string {
        const scenarioId = parsedInput[0] as string;

        if (functionName === 'createSystem') {
            return this.eventEmitterScenario(scenarioId);
        }
        if (functionName === 'createGreeter') {
            return this.greetingSystemScenario(scenarioId);
        }
        if (functionName === 'createTodoApp') {
            return this.todoAppScenario(scenarioId);
        }
        if (functionName === 'createUserApi') {
            return this.userApiScenario(scenarioId);
        }
        // Generic single-function test — spread all input args
        return `
      const args = ${JSON.stringify(parsedInput)};
      return ${functionName}(...args);
    `;
    }

    private eventEmitterScenario(scenario: string): string {
        switch (scenario) {
            case 'basic-emit':
                return `
          var sys = createSystem();
          sys.emit("message", "hello");
          var logs = sys.getLogs().map(function(l) { return { event: l.event, data: l.data }; });
          return logs;
        `;
            case 'multi-event':
                return `
          var sys = createSystem();
          sys.emit("message", "first");
          sys.emit("error", "oops");
          sys.emit("message", "second");
          var logs = sys.getLogs().map(function(l) { return { event: l.event, data: l.data }; });
          return logs;
        `;
            case 'unsubscribe':
                return `
          var sys = createSystem();
          sys.emit("message", "before");
          var emitter = sys.emitter;
          var handlers = emitter._events && emitter._events["message"] ? emitter._events["message"].slice() : [];
          if (handlers.length > 0) { emitter.off("message", handlers[0]); }
          sys.emit("message", "after");
          var logs = sys.getLogs().map(function(l) { return { event: l.event, data: l.data }; });
          return logs;
        `;
            case 'multi-handler':
                return `
          var sys = createSystem();
          var count = 0;
          sys.emitter.on("ping", function() { count++; });
          sys.emitter.on("ping", function() { count++; });
          sys.emitter.emit("ping");
          return { count: count };
        `;
            case 'no-listeners':
                return `
          var sys = createSystem();
          sys.emitter.emit("unknown-event", "data");
          var logs = sys.getLogs().filter(function(l) { return l.event === "unknown-event"; });
          return logs;
        `;
            default:
                return 'return null;';
        }
    }

    private greetingSystemScenario(scenario: string): string {
        switch (scenario) {
            case 'basic-greet':
                return `
          var sys = createGreeter();
          return sys.greet("world");
        `;
            case 'multi-greet':
                return `
          var sys = createGreeter();
          return sys.greetMultiple(["alice", "bob"]);
        `;
            case 'empty-string':
                return `
          var sys = createGreeter();
          return sys.greet("");
        `;
            case 'get-greeter':
                return `
          var sys = createGreeter();
          return typeof sys.greeter === "object" && typeof sys.greeter.greet === "function";
        `;
            case 'already-capitalized':
                return `
          var sys = createGreeter();
          return sys.greet("Alice");
        `;
            default:
                return 'return null;';
        }
    }

    private todoAppScenario(scenario: string): string {
        switch (scenario) {
            case 'add-valid':
                return `
          var app = createTodoApp();
          var result = app.add("Buy milk", "high");
          return {
            success: result.success,
            hasId: typeof (result.todo && result.todo.id) === "number",
            title: result.todo ? result.todo.title : null,
            priority: result.todo ? result.todo.priority : null,
            completed: result.todo ? result.todo.completed : null
          };
        `;
            case 'add-invalid-empty':
                return `
          var app = createTodoApp();
          var result = app.add("", "high");
          return {
            success: result.success,
            hasErrors: Array.isArray(result.errors) && result.errors.length > 0
          };
        `;
            case 'add-invalid-priority':
                return `
          var app = createTodoApp();
          var result = app.add("Valid title", "urgent");
          return {
            success: result.success,
            hasErrors: Array.isArray(result.errors) && result.errors.length > 0
          };
        `;
            case 'toggle':
                return `
          var app = createTodoApp();
          app.add("Task 1", "low");
          var todos = app.list();
          var toggled = app.toggle(todos[0].id);
          return { completed: toggled ? toggled.completed : null };
        `;
            case 'filter':
                return `
          var app = createTodoApp();
          app.add("Task A", "low");
          app.add("Task B", "high");
          var todos = app.list();
          app.toggle(todos[0].id);
          return {
            completed: app.listCompleted().length,
            pending: app.listPending().length
          };
        `;
            case 'remove':
                return `
          var app = createTodoApp();
          app.add("Task X", "medium");
          app.add("Task Y", "high");
          var todos = app.list();
          var removed = app.remove(todos[0].id);
          return {
            removed: removed,
            remaining: app.list().length
          };
        `;
            default:
                return 'return null;';
        }
    }

    /**
     * User DB API scenarios -- in-memory database CRUD.
     */
    private userApiScenario(scenario: string): string {
        switch (scenario) {
            case 'init-and-empty':
                return `
          var api = createUserApi();
          return api.getAllUsers();
        `;
            case 'add-user':
                return `
          var api = createUserApi();
          var user = api.addUser("Alice", "alice@test.com");
          return { id: user.id, name: user.name, email: user.email };
        `;
            case 'get-all-after-add':
                return `
          var api = createUserApi();
          api.addUser("Alice", "alice@test.com");
          api.addUser("Bob", "bob@test.com");
          var users = api.getAllUsers();
          return users.map(function(u) { return { id: u.id, name: u.name }; });
        `;
            case 'get-by-id':
                return `
          var api = createUserApi();
          api.addUser("Alice", "alice@test.com");
          return api.getUserById(1).name;
        `;
            case 'user-not-found':
                return `
          var api = createUserApi();
          return api.getUserById(999);
        `;
            case 'delete-user':
                return `
          var api = createUserApi();
          api.addUser("Alice", "alice@test.com");
          api.addUser("Bob", "bob@test.com");
          var deleted = api.deleteUser(1);
          return { deleted: deleted, remaining: api.getAllUsers().length };
        `;
            default:
                return 'return null;';
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
