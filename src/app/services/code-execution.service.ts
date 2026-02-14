import { Injectable } from '@angular/core';
import { TestCase, TestResult, ProjectFile } from '../models/problem.model';

@Injectable({
    providedIn: 'root'
})
export class CodeExecutionService {

    executeCode(userCode: string, functionName: string, testCases: TestCase[]): TestResult[] {
        const results: TestResult[] = [];

        for (const testCase of testCases) {
            const startTime = performance.now();
            try {
                const args: unknown[] = JSON.parse(testCase.input);
                // Create a sandboxed function from user code
                const wrappedCode = `
          ${userCode}
          return ${functionName}(...args);
        `;

                const fn = new Function('args', wrappedCode);
                let actualOutput = fn(args);

                // For in-place modification functions (like reverseString), handle specially
                if (actualOutput === undefined && args.length > 0 && Array.isArray(args[0])) {
                    actualOutput = args[0];
                }

                const executionTime = performance.now() - startTime;
                const actualStr = JSON.stringify(actualOutput);
                const expectedStr = testCase.expectedOutput;

                // Compare outputs
                const passed = this.compareOutputs(actualStr, expectedStr);

                results.push({
                    testCase,
                    passed,
                    actualOutput: actualStr,
                    executionTime
                });
            } catch (error: unknown) {
                const executionTime = performance.now() - startTime;
                const errMsg = error instanceof Error ? error.message : String(error);
                results.push({
                    testCase,
                    passed: false,
                    actualOutput: 'Error',
                    error: errMsg,
                    executionTime
                });
            }
        }

        return results;
    }

    /**
     * Execute multi-file code with scenario-based test harnesses.
     * Each test case uses a scenario identifier (e.g. "basic-emit", "add-valid")
     * that maps to a specific test script exercising the user's solution.
     */
    executeMultiFileCode(files: ProjectFile[], entryPoint: string, testCases: TestCase[]): TestResult[] {
        const results: TestResult[] = [];

        // Build combined source: non-entry files first, then entry point
        const entryFile = files.find(f => f.name === entryPoint);
        const otherFiles = files.filter(f => f.name !== entryPoint);

        // Strip require/import/export for browser sandbox
        const cleanCode = (code: string) => {
            return code
                .replace(/^const\s+\{[^}]+\}\s*=\s*require\([^)]+\);?\s*$/gm, '')
                .replace(/^const\s+\w+\s*=\s*require\([^)]+\);?\s*$/gm, '')
                .replace(/^module\.exports\s*=\s*\{[^}]*\};?\s*$/gm, '')
                .replace(/^module\.exports\s*=\s*\w+;?\s*$/gm, '')
                .replace(/^export\s+/gm, '')
                .replace(/^import\s+.*$/gm, '');
        };

        const combinedCode = [
            ...otherFiles.map(f => cleanCode(f.content)),
            entryFile ? cleanCode(entryFile.content) : ''
        ].join('\n\n');

        // Identify which problem we're testing based on the entry point function
        const functionMatch = entryFile?.content.match(/function\s+(\w+)/);
        const functionName = functionMatch ? functionMatch[1] : '';

        for (const testCase of testCases) {
            const startTime = performance.now();
            try {
                const scenarioId = JSON.parse(testCase.input)[0] as string;
                const testScript = this.buildScenarioTestScript(functionName, scenarioId);

                const wrappedCode = `
                    ${combinedCode}
                    ${testScript}
                `;

                const fn = new Function(wrappedCode);
                const actualOutput = fn();

                const executionTime = performance.now() - startTime;
                const actualStr = JSON.stringify(actualOutput);
                const passed = this.compareOutputs(actualStr, testCase.expectedOutput);

                results.push({
                    testCase,
                    passed,
                    actualOutput: actualStr,
                    executionTime
                });
            } catch (error: unknown) {
                const executionTime = performance.now() - startTime;
                const errMsg = error instanceof Error ? error.message : String(error);
                results.push({
                    testCase,
                    passed: false,
                    actualOutput: 'Error',
                    error: errMsg,
                    executionTime
                });
            }
        }

        return results;
    }

    /**
     * Build the inline test script for a given scenario.
     * Returns JS code that creates the system, performs actions, and returns the result.
     */
    private buildScenarioTestScript(functionName: string, scenarioId: string): string {
        // ── Event Emitter scenarios ──
        if (functionName === 'createSystem') {
            return this.eventEmitterScenario(scenarioId);
        }
        // ── Todo App Data Layer scenarios ──
        if (functionName === 'createTodoApp') {
            return this.todoAppScenario(scenarioId);
        }
        return `return null;`;
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
                    // Unsubscribe the logger from message events by using off
                    var emitter = sys.emitter;
                    var logger = sys.logger;
                    // Find and remove logger's handler for "message"
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
                return `return null;`;
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
                return `return null;`;
        }
    }

    private compareOutputs(actual: string, expected: string): boolean {
        try {
            const actualParsed = JSON.parse(actual);
            const expectedParsed = JSON.parse(expected);
            return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
        } catch {
            return actual === expected;
        }
    }
}
