"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var Judge0Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Judge0Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let Judge0Service = Judge0Service_1 = class Judge0Service {
    config;
    client;
    logger = new common_1.Logger(Judge0Service_1.name);
    constructor(config) {
        this.config = config;
        const rapidApiKey = this.config.get('RAPIDAPI_KEY', '');
        const rapidApiHost = this.config.get('RAPIDAPI_HOST', 'judge0-ce.p.rapidapi.com');
        this.client = axios_1.default.create({
            baseURL: `https://${rapidApiHost}`,
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': rapidApiHost,
            },
        });
    }
    async executeCode(files, entryPoint, testCases) {
        const entryFile = files.find((f) => f.name === entryPoint);
        const otherFiles = files.filter((f) => f.name !== entryPoint);
        const combinedCode = [
            ...otherFiles.map((f) => this.cleanCode(f.content)),
            entryFile ? this.cleanCode(entryFile.content) : '',
        ].join('\n\n');
        const functionMatch = entryFile?.content.match(/function\s+(\w+)/);
        const functionName = functionMatch ? functionMatch[1] : '';
        const submissions = testCases.map((tc) => {
            const parsedInput = JSON.parse(tc.input);
            const testScript = this.buildScenarioTestScript(functionName, parsedInput);
            const fullSource = `
${combinedCode}

// --- Test Harness ---
const __result = (() => {
  ${testScript}
})();
console.log(JSON.stringify(__result));
`;
            return {
                language_id: 63,
                source_code: Buffer.from(fullSource).toString('base64'),
                stdin: '',
                expected_output: Buffer.from(tc.expectedOutput).toString('base64'),
                cpu_time_limit: 5,
                memory_limit: 128000,
                wall_time_limit: 10,
            };
        });
        const { data: tokenData } = await this.client.post('/submissions/batch?base64_encoded=true&wait=false', { submissions });
        const tokens = tokenData.map((t) => t.token);
        const results = await this.pollResults(tokens);
        return results.map((result, i) => {
            const tc = testCases[i];
            const stdout = result.stdout
                ? Buffer.from(result.stdout, 'base64').toString('utf-8').trim()
                : '';
            const stderr = result.stderr
                ? Buffer.from(result.stderr, 'base64').toString('utf-8')
                : '';
            const statusId = result.status?.id ?? 0;
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
    async pollResults(tokens, maxAttempts = 30, intervalMs = 1000) {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const { data } = await this.client.get(`/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=true&fields=stdout,stderr,status,time,memory`);
            const submissions = data.submissions;
            const allDone = submissions.every((s) => s.status && s.status.id >= 3);
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
    cleanCode(code) {
        return code
            .replace(/^(?:const|let|var)\s+\{[^}]+\}\s*=\s*require\([^)]+\);?\s*$/gm, '')
            .replace(/^(?:const|let|var)\s+\w+\s*=\s*require\([^)]+\);?\s*$/gm, '')
            .replace(/^module\.exports\s*=\s*\{[^}]*\};?\s*$/gm, '')
            .replace(/^module\.exports\s*=\s*\w+;?\s*$/gm, '')
            .replace(/^export\s+/gm, '')
            .replace(/^import\s+.*$/gm, '');
    }
    compareOutputs(actual, expected) {
        try {
            const actualParsed = JSON.parse(actual);
            const expectedParsed = JSON.parse(expected);
            return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
        }
        catch {
            return actual.trim() === expected.trim();
        }
    }
    buildScenarioTestScript(functionName, parsedInput) {
        const scenarioId = parsedInput[0];
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
        return `
      const args = ${JSON.stringify(parsedInput)};
      return ${functionName}(...args);
    `;
    }
    eventEmitterScenario(scenario) {
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
    greetingSystemScenario(scenario) {
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
    todoAppScenario(scenario) {
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
    userApiScenario(scenario) {
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
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.Judge0Service = Judge0Service;
exports.Judge0Service = Judge0Service = Judge0Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], Judge0Service);
//# sourceMappingURL=judge0.service.js.map