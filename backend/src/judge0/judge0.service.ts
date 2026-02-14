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

/**
 * Map of language names to Judge0 CE language IDs.
 */
const LANGUAGE_MAP: Record<string, number> = {
    javascript: 63,   // Node.js 12.14.0
    python: 71,        // Python 3.8.1
    java: 62,          // Java (OpenJDK 13.0.1)
    cpp: 54,           // C++ (GCC 9.2.0)
    typescript: 74,    // TypeScript (3.7.4)
    go: 60,            // Go (1.13.5)
    rust: 73,          // Rust (1.40.0)
    c: 50,             // C (GCC 9.2.0)
    csharp: 51,        // C# (Mono 6.6.0.161)
    ruby: 72,          // Ruby (2.7.0)
    php: 68,           // PHP (7.4.1)
    kotlin: 78,        // Kotlin (1.3.70)
    swift: 83,         // Swift (5.2.3)
    bash: 46,          // Bash (5.0.0)
};

/**
 * Map of language names to default entry points.
 */
const ENTRY_POINTS: Record<string, string> = {
    javascript: 'index.js',
    python: 'main.py',
    java: 'Main.java',
    cpp: 'main.cpp',
    typescript: 'index.ts',
    go: 'main.go',
    rust: 'main.rs',
    c: 'main.c',
    csharp: 'Main.cs',
    ruby: 'main.rb',
    php: 'index.php',
    kotlin: 'Main.kt',
    swift: 'main.swift',
    bash: 'script.sh',
};

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
     * Get the Judge0 language ID for a given language name.
     */
    getLanguageId(language: string): number {
        return LANGUAGE_MAP[language] ?? LANGUAGE_MAP.javascript;
    }

    /**
     * Get the default entry point filename for a language.
     */
    getEntryPoint(language: string): string {
        return ENTRY_POINTS[language] ?? ENTRY_POINTS.javascript;
    }

    /**
     * Submit code for all test cases and return results.
     * Supports multiple languages — determines harness by language.
     */
    async executeCode(
        files: ProjectFile[],
        entryPoint: string,
        testCases: TestCase[],
        language: string = 'javascript',
    ): Promise<TestResult[]> {
        const languageId = this.getLanguageId(language);

        // Build combined source code
        const entryFile = files.find((f) => f.name === entryPoint);
        const otherFiles = files.filter((f) => f.name !== entryPoint);

        const combinedCode = [
            ...otherFiles.map((f) => this.cleanCode(f.content, language)),
            entryFile ? this.cleanCode(entryFile.content, language) : '',
        ].join('\n\n');

        // Identify function/entry name
        const functionName = this.extractFunctionName(entryFile?.content ?? '', language);

        // Build Judge0 submissions
        const submissions: Judge0Submission[] = testCases.map((tc) => {
            const fullSource = this.buildFullSource(
                combinedCode, functionName, tc, language,
            );

            return {
                language_id: languageId,
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

    // ── Source Building ──

    /**
     * Build full source code with test harness for a given test case.
     */
    private buildFullSource(
        combinedCode: string,
        functionName: string,
        tc: TestCase,
        language: string,
    ): string {
        const parsedInput = JSON.parse(tc.input);

        switch (language) {
            case 'python':
                return this.buildPythonSource(combinedCode, functionName, parsedInput);
            case 'java':
                return this.buildJavaSource(combinedCode, functionName, parsedInput);
            case 'cpp':
                return this.buildCppSource(combinedCode, functionName, parsedInput);
            case 'typescript':
                return this.buildTypeScriptSource(combinedCode, functionName, parsedInput);
            case 'go':
                return this.buildGoSource(combinedCode, functionName, parsedInput);
            case 'rust':
                return this.buildRustSource(combinedCode, functionName, parsedInput);
            case 'javascript':
            default:
                return this.buildJavaScriptSource(combinedCode, functionName, parsedInput);
        }
    }

    // ── JavaScript ──

    private buildJavaScriptSource(code: string, fn: string, input: any[]): string {
        const scenarioId = input[0] as string;

        // Check for scenario-based problems
        if (fn === 'createSystem') {
            return `${code}\n\nconst __result = (() => {\n  ${this.eventEmitterScenario(scenarioId)}\n})();\nconsole.log(JSON.stringify(__result));`;
        }
        if (fn === 'createGreeter') {
            return `${code}\n\nconst __result = (() => {\n  ${this.greetingSystemScenario(scenarioId)}\n})();\nconsole.log(JSON.stringify(__result));`;
        }
        if (fn === 'createTodoApp') {
            return `${code}\n\nconst __result = (() => {\n  ${this.todoAppScenario(scenarioId)}\n})();\nconsole.log(JSON.stringify(__result));`;
        }
        if (fn === 'createUserApi') {
            return `${code}\n\nconst __result = (() => {\n  ${this.userApiScenario(scenarioId)}\n})();\nconsole.log(JSON.stringify(__result));`;
        }
        if (fn === 'createTaskManager') {
            return `${code}\n\nconst __result = (() => {\n  ${this.jsTaskManagerScenario(scenarioId)}\n})();\nconsole.log(JSON.stringify(__result));`;
        }

        // Generic: spread input args to function
        return `${code}\n\nconst __result = ${fn}(${input.map(a => JSON.stringify(a)).join(', ')});\nconsole.log(JSON.stringify(__result));`;
    }

    // ── Python ──

    private buildPythonSource(code: string, fn: string, input: any[]): string {
        const scenarioId = input[0] as string;

        if (fn === 'create_task_manager') {
            return `${code}\n\n${this.pythonTaskManagerScenario(scenarioId)}`;
        }

        // Generic
        const args = input.map(a => JSON.stringify(a)).join(', ');
        return `import json\n${code}\nresult = ${fn}(${args})\nprint(json.dumps(result))`;
    }

    // ── Java ──

    private buildJavaSource(code: string, fn: string, input: any[]): string {
        const scenarioId = input[0] as string;

        if (fn === 'createTaskManager') {
            return this.javaTaskManagerScenario(code, scenarioId);
        }

        // Generic — wrap user's static method in a Main class with main()
        const args = input.map(a => this.javaLiteral(a)).join(', ');
        return `import java.util.*;
import java.util.stream.*;

${code}

public class Main {
    public static void main(String[] args) {
        Object result = Solution.${fn}(${args});
        if (result instanceof int[]) {
            System.out.println(Arrays.toString((int[])result));
        } else if (result instanceof String[]) {
            System.out.println("[" + String.join(", ", Arrays.stream((String[])result).map(s -> "\\"" + s + "\\"").toArray(String[]::new)) + "]");
        } else {
            System.out.println(result);
        }
    }
}`;
    }

    // ── C++ ──

    private buildCppSource(code: string, fn: string, input: any[]): string {
        const scenarioId = input[0] as string;

        if (fn === 'createTaskManager') {
            return this.cppTaskManagerScenario(code, scenarioId);
        }

        // Generic — wrap user's function with main() and cout
        const args = input.map(a => this.cppLiteral(a)).join(', ');
        return `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

${code}

int main() {
    auto result = ${fn}(${args});
    cout << result << endl;
    return 0;
}`;
    }

    // ── TypeScript ──

    private buildTypeScriptSource(code: string, fn: string, input: any[]): string {
        const scenarioId = input[0] as string;

        if (fn === 'createTaskManager') {
            return `${code}\n\nconst __result = (() => {\n  ${this.tsTaskManagerScenario(scenarioId)}\n})();\nconsole.log(JSON.stringify(__result));`;
        }

        const args = input.map(a => JSON.stringify(a)).join(', ');
        return `${code}\n\nconst __result = ${fn}(${args});\nconsole.log(JSON.stringify(__result));`;
    }

    // ── Go ──

    private buildGoSource(code: string, fn: string, input: any[]): string {
        const scenarioId = input[0] as string;

        if (fn === 'createTaskManager') {
            return this.goTaskManagerScenario(code, scenarioId);
        }

        // Generic — wrap user's function with main() and fmt.Println
        const args = input.map(a => this.goLiteral(a)).join(', ');
        const fnCapitalized = fn.charAt(0).toUpperCase() + fn.slice(1);
        return `package main

import (
    "fmt"
    "encoding/json"
)

${code}

func main() {
    result := ${fnCapitalized}(${args})
    jsonBytes, _ := json.Marshal(result)
    fmt.Println(string(jsonBytes))
}`;
    }

    // ── Rust ──

    private buildRustSource(code: string, fn: string, input: any[]): string {
        const scenarioId = input[0] as string;

        if (fn === 'createTaskManager') {
            return this.rustTaskManagerScenario(code, scenarioId);
        }

        // Generic — wrap user's function with main() and println!
        const args = input.map(a => this.rustLiteral(a)).join(', ');
        return `${code}

fn main() {
    let result = ${fn}(${args});
    println!("{}", result);
}`;
    }

    // ── Language-Specific Scenario Harnesses ──

    // --- JavaScript Task Manager ---
    private jsTaskManagerScenario(scenario: string): string {
        switch (scenario) {
            case 'add-task':
                return `var tm = createTaskManager(); var t = tm.addTask("Buy milk", "high"); return { id: t.id, title: t.title, priority: t.priority, done: t.done };`;
            case 'list-tasks':
                return `var tm = createTaskManager(); tm.addTask("A","low"); tm.addTask("B","high"); return tm.listTasks().map(function(t){ return t.title; });`;
            case 'complete-task':
                return `var tm = createTaskManager(); var t = tm.addTask("Task","medium"); tm.completeTask(t.id); var updated = tm.listTasks()[0]; return { done: updated.done };`;
            case 'remove-task':
                return `var tm = createTaskManager(); tm.addTask("A","low"); var b = tm.addTask("B","high"); tm.removeTask(b.id); return { count: tm.listTasks().length };`;
            case 'filter-by-priority':
                return `var tm = createTaskManager(); tm.addTask("A","low"); tm.addTask("B","high"); tm.addTask("C","high"); return { count: tm.filterByPriority("high").length };`;
            default: return 'return null;';
        }
    }

    // --- Python Task Manager ---
    private pythonTaskManagerScenario(scenario: string): string {
        switch (scenario) {
            case 'add-task':
                return `import json\ntm = create_task_manager()\nt = tm.add_task("Buy milk", "high")\nprint(json.dumps({"id": t["id"], "title": t["title"], "priority": t["priority"], "done": t["done"]}))`;
            case 'list-tasks':
                return `import json\ntm = create_task_manager()\ntm.add_task("A", "low")\ntm.add_task("B", "high")\nresult = [t["title"] for t in tm.list_tasks()]\nprint(json.dumps(result))`;
            case 'complete-task':
                return `import json\ntm = create_task_manager()\nt = tm.add_task("Task", "medium")\ntm.complete_task(t["id"])\nupdated = tm.list_tasks()[0]\nprint(json.dumps({"done": updated["done"]}))`;
            case 'remove-task':
                return `import json\ntm = create_task_manager()\ntm.add_task("A", "low")\nb = tm.add_task("B", "high")\ntm.remove_task(b["id"])\nprint(json.dumps({"count": len(tm.list_tasks())}))`;
            case 'filter-by-priority':
                return `import json\ntm = create_task_manager()\ntm.add_task("A", "low")\ntm.add_task("B", "high")\ntm.add_task("C", "high")\nresult = tm.filter_by_priority("high")\nprint(json.dumps({"count": len(result)}))`;
            default: return 'import json\nprint(json.dumps(None))';
        }
    }

    // --- Java Task Manager ---
    private javaTaskManagerScenario(userCode: string, scenario: string): string {
        let testBody: string;
        switch (scenario) {
            case 'add-task':
                testBody = `TaskManager tm = new TaskManager();\n        Task t = tm.addTask("Buy milk", "high");\n        System.out.println("{\\"id\\":" + t.id + ",\\"title\\":\\"" + t.title + "\\",\\"priority\\":\\"" + t.priority + "\\",\\"done\\":" + t.done + "}");`;
                break;
            case 'list-tasks':
                testBody = `TaskManager tm = new TaskManager();\n        tm.addTask("A", "low");\n        tm.addTask("B", "high");\n        java.util.List<Task> tasks = tm.listTasks();\n        StringBuilder sb = new StringBuilder("[");\n        for (int i = 0; i < tasks.size(); i++) { if (i > 0) sb.append(","); sb.append("\\"").append(tasks.get(i).title).append("\\""); }\n        sb.append("]");\n        System.out.println(sb.toString());`;
                break;
            case 'complete-task':
                testBody = `TaskManager tm = new TaskManager();\n        Task t = tm.addTask("Task", "medium");\n        tm.completeTask(t.id);\n        Task updated = tm.listTasks().get(0);\n        System.out.println("{\\"done\\":" + updated.done + "}");`;
                break;
            case 'remove-task':
                testBody = `TaskManager tm = new TaskManager();\n        tm.addTask("A", "low");\n        Task b = tm.addTask("B", "high");\n        tm.removeTask(b.id);\n        System.out.println("{\\"count\\":" + tm.listTasks().size() + "}");`;
                break;
            case 'filter-by-priority':
                testBody = `TaskManager tm = new TaskManager();\n        tm.addTask("A", "low");\n        tm.addTask("B", "high");\n        tm.addTask("C", "high");\n        System.out.println("{\\"count\\":" + tm.filterByPriority("high").size() + "}");`;
                break;
            default:
                testBody = 'System.out.println("null");';
        }

        return `import java.util.ArrayList;\nimport java.util.List;\nimport java.util.stream.Collectors;\n\n${userCode}\n\npublic class Main {\n    public static void main(String[] args) {\n        ${testBody}\n    }\n}`;
    }

    // --- C++ Task Manager ---
    private cppTaskManagerScenario(userCode: string, scenario: string): string {
        let testBody: string;
        switch (scenario) {
            case 'add-task':
                testBody = `TaskManager tm;\n    Task t = tm.addTask("Buy milk", "high");\n    cout << "{\\"id\\":" << t.id << ",\\"title\\":\\"" << t.title << "\\",\\"priority\\":\\"" << t.priority << "\\",\\"done\\":" << (t.done ? "true" : "false") << "}" << endl;`;
                break;
            case 'list-tasks':
                testBody = `TaskManager tm;\n    tm.addTask("A", "low");\n    tm.addTask("B", "high");\n    auto tasks = tm.listTasks();\n    cout << "[";\n    for (int i = 0; i < tasks.size(); i++) { if (i > 0) cout << ","; cout << "\\"" << tasks[i].title << "\\""; }\n    cout << "]" << endl;`;
                break;
            case 'complete-task':
                testBody = `TaskManager tm;\n    Task t = tm.addTask("Task", "medium");\n    tm.completeTask(t.id);\n    auto tasks = tm.listTasks();\n    cout << "{\\"done\\":" << (tasks[0].done ? "true" : "false") << "}" << endl;`;
                break;
            case 'remove-task':
                testBody = `TaskManager tm;\n    tm.addTask("A", "low");\n    Task b = tm.addTask("B", "high");\n    tm.removeTask(b.id);\n    cout << "{\\"count\\":" << tm.listTasks().size() << "}" << endl;`;
                break;
            case 'filter-by-priority':
                testBody = `TaskManager tm;\n    tm.addTask("A", "low");\n    tm.addTask("B", "high");\n    tm.addTask("C", "high");\n    cout << "{\\"count\\":" << tm.filterByPriority("high").size() << "}" << endl;`;
                break;
            default:
                testBody = 'cout << "null" << endl;';
        }

        return `#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\n${userCode}\n\nint main() {\n    ${testBody}\n    return 0;\n}`;
    }

    // --- TypeScript Task Manager ---
    private tsTaskManagerScenario(scenario: string): string {
        switch (scenario) {
            case 'add-task':
                return `const tm = createTaskManager(); const t = tm.addTask("Buy milk", "high"); return { id: t.id, title: t.title, priority: t.priority, done: t.done };`;
            case 'list-tasks':
                return `const tm = createTaskManager(); tm.addTask("A","low"); tm.addTask("B","high"); return tm.listTasks().map(t => t.title);`;
            case 'complete-task':
                return `const tm = createTaskManager(); const t = tm.addTask("Task","medium"); tm.completeTask(t.id); const updated = tm.listTasks()[0]; return { done: updated.done };`;
            case 'remove-task':
                return `const tm = createTaskManager(); tm.addTask("A","low"); const b = tm.addTask("B","high"); tm.removeTask(b.id); return { count: tm.listTasks().length };`;
            case 'filter-by-priority':
                return `const tm = createTaskManager(); tm.addTask("A","low"); tm.addTask("B","high"); tm.addTask("C","high"); return { count: tm.filterByPriority("high").length };`;
            default: return 'return null;';
        }
    }

    // --- Go Task Manager ---
    private goTaskManagerScenario(userCode: string, scenario: string): string {
        let testBody: string;
        switch (scenario) {
            case 'add-task':
                testBody = `tm := NewTaskManager()\n\tt := tm.AddTask("Buy milk", "high")\n\tfmt.Printf("{\\\"id\\\":%d,\\\"title\\\":\\\"%s\\\",\\\"priority\\\":\\\"%s\\\",\\\"done\\\":%t}\\n", t.ID, t.Title, t.Priority, t.Done)`;
                break;
            case 'list-tasks':
                testBody = `tm := NewTaskManager()\n\ttm.AddTask("A", "low")\n\ttm.AddTask("B", "high")\n\ttasks := tm.ListTasks()\n\tfmt.Print("[")\n\tfor i, t := range tasks { if i > 0 { fmt.Print(",") }; fmt.Printf("\\\"%s\\\"", t.Title) }\n\tfmt.Println("]")`;
                break;
            case 'complete-task':
                testBody = `tm := NewTaskManager()\n\tt := tm.AddTask("Task", "medium")\n\ttm.CompleteTask(t.ID)\n\tupdated := tm.ListTasks()[0]\n\tfmt.Printf("{\\\"done\\\":%t}\\n", updated.Done)`;
                break;
            case 'remove-task':
                testBody = `tm := NewTaskManager()\n\ttm.AddTask("A", "low")\n\tb := tm.AddTask("B", "high")\n\ttm.RemoveTask(b.ID)\n\tfmt.Printf("{\\\"count\\\":%d}\\n", len(tm.ListTasks()))`;
                break;
            case 'filter-by-priority':
                testBody = `tm := NewTaskManager()\n\ttm.AddTask("A", "low")\n\ttm.AddTask("B", "high")\n\ttm.AddTask("C", "high")\n\tfmt.Printf("{\\\"count\\\":%d}\\n", len(tm.FilterByPriority("high")))`;
                break;
            default:
                testBody = 'fmt.Println("null")';
        }

        return `package main\n\nimport "fmt"\n\n${userCode}\n\nfunc main() {\n\t${testBody}\n}`;
    }

    // --- Rust Task Manager ---
    private rustTaskManagerScenario(userCode: string, scenario: string): string {
        let testBody: string;
        switch (scenario) {
            case 'add-task':
                testBody = `let mut tm = TaskManager::new();\n    let t = tm.add_task("Buy milk".to_string(), "high".to_string());\n    println!("{{\\"id\\":{},\\"title\\":\\"{}\\",\\"priority\\":\\"{}\\",\\"done\\":{}}}", t.id, t.title, t.priority, t.done);`;
                break;
            case 'list-tasks':
                testBody = `let mut tm = TaskManager::new();\n    tm.add_task("A".to_string(), "low".to_string());\n    tm.add_task("B".to_string(), "high".to_string());\n    let tasks = tm.list_tasks();\n    let titles: Vec<String> = tasks.iter().map(|t| format!("\\"{}\\"", t.title)).collect();\n    println!("[{}]", titles.join(","));`;
                break;
            case 'complete-task':
                testBody = `let mut tm = TaskManager::new();\n    let t = tm.add_task("Task".to_string(), "medium".to_string());\n    tm.complete_task(t.id);\n    let tasks = tm.list_tasks();\n    println!("{{\\"done\\":{}}}", tasks[0].done);`;
                break;
            case 'remove-task':
                testBody = `let mut tm = TaskManager::new();\n    tm.add_task("A".to_string(), "low".to_string());\n    let b = tm.add_task("B".to_string(), "high".to_string());\n    tm.remove_task(b.id);\n    println!("{{\\"count\\":{}}}", tm.list_tasks().len());`;
                break;
            case 'filter-by-priority':
                testBody = `let mut tm = TaskManager::new();\n    tm.add_task("A".to_string(), "low".to_string());\n    tm.add_task("B".to_string(), "high".to_string());\n    tm.add_task("C".to_string(), "high".to_string());\n    println!("{{\\"count\\":{}}}", tm.filter_by_priority("high").len());`;
                break;
            default:
                testBody = 'println!("null");';
        }

        return `${userCode}\n\nfn main() {\n    ${testBody}\n}`;
    }

    // ── Existing JS Scenario Harnesses ──

    private eventEmitterScenario(scenario: string): string {
        switch (scenario) {
            case 'basic-emit':
                return `var sys = createSystem(); sys.emit("message", "hello"); var logs = sys.getLogs().map(function(l) { return { event: l.event, data: l.data }; }); return logs;`;
            case 'multi-event':
                return `var sys = createSystem(); sys.emit("message", "first"); sys.emit("error", "oops"); sys.emit("message", "second"); var logs = sys.getLogs().map(function(l) { return { event: l.event, data: l.data }; }); return logs;`;
            case 'unsubscribe':
                return `var sys = createSystem(); sys.emit("message", "before"); var emitter = sys.emitter; var handlers = emitter._events && emitter._events["message"] ? emitter._events["message"].slice() : []; if (handlers.length > 0) { emitter.off("message", handlers[0]); } sys.emit("message", "after"); var logs = sys.getLogs().map(function(l) { return { event: l.event, data: l.data }; }); return logs;`;
            case 'multi-handler':
                return `var sys = createSystem(); var count = 0; sys.emitter.on("ping", function() { count++; }); sys.emitter.on("ping", function() { count++; }); sys.emitter.emit("ping"); return { count: count };`;
            case 'no-listeners':
                return `var sys = createSystem(); sys.emitter.emit("unknown-event", "data"); var logs = sys.getLogs().filter(function(l) { return l.event === "unknown-event"; }); return logs;`;
            default: return 'return null;';
        }
    }

    private greetingSystemScenario(scenario: string): string {
        switch (scenario) {
            case 'basic-greet': return `var sys = createGreeter(); return sys.greet("world");`;
            case 'multi-greet': return `var sys = createGreeter(); return sys.greetMultiple(["alice", "bob"]);`;
            case 'empty-string': return `var sys = createGreeter(); return sys.greet("");`;
            case 'get-greeter': return `var sys = createGreeter(); return typeof sys.greeter === "object" && typeof sys.greeter.greet === "function";`;
            case 'already-capitalized': return `var sys = createGreeter(); return sys.greet("Alice");`;
            default: return 'return null;';
        }
    }

    private todoAppScenario(scenario: string): string {
        switch (scenario) {
            case 'add-valid':
                return `var app = createTodoApp(); var result = app.add("Buy milk", "high"); return { success: result.success, hasId: typeof (result.todo && result.todo.id) === "number", title: result.todo ? result.todo.title : null, priority: result.todo ? result.todo.priority : null, completed: result.todo ? result.todo.completed : null };`;
            case 'add-invalid-empty':
                return `var app = createTodoApp(); var result = app.add("", "high"); return { success: result.success, hasErrors: Array.isArray(result.errors) && result.errors.length > 0 };`;
            case 'add-invalid-priority':
                return `var app = createTodoApp(); var result = app.add("Valid title", "urgent"); return { success: result.success, hasErrors: Array.isArray(result.errors) && result.errors.length > 0 };`;
            case 'toggle':
                return `var app = createTodoApp(); app.add("Task 1", "low"); var todos = app.list(); var toggled = app.toggle(todos[0].id); return { completed: toggled ? toggled.completed : null };`;
            case 'filter':
                return `var app = createTodoApp(); app.add("Task A", "low"); app.add("Task B", "high"); var todos = app.list(); app.toggle(todos[0].id); return { completed: app.listCompleted().length, pending: app.listPending().length };`;
            case 'remove':
                return `var app = createTodoApp(); app.add("Task X", "medium"); app.add("Task Y", "high"); var todos = app.list(); var removed = app.remove(todos[0].id); return { removed: removed, remaining: app.list().length };`;
            default: return 'return null;';
        }
    }

    private userApiScenario(scenario: string): string {
        switch (scenario) {
            case 'init-and-empty': return `var api = createUserApi(); return api.getAllUsers();`;
            case 'add-user': return `var api = createUserApi(); var user = api.addUser("Alice", "alice@test.com"); return { id: user.id, name: user.name, email: user.email };`;
            case 'get-all-after-add': return `var api = createUserApi(); api.addUser("Alice", "alice@test.com"); api.addUser("Bob", "bob@test.com"); var users = api.getAllUsers(); return users.map(function(u) { return { id: u.id, name: u.name }; });`;
            case 'get-by-id': return `var api = createUserApi(); api.addUser("Alice", "alice@test.com"); return api.getUserById(1).name;`;
            case 'user-not-found': return `var api = createUserApi(); return api.getUserById(999);`;
            case 'delete-user': return `var api = createUserApi(); api.addUser("Alice", "alice@test.com"); api.addUser("Bob", "bob@test.com"); var deleted = api.deleteUser(1); return { deleted: deleted, remaining: api.getAllUsers().length };`;
            default: return 'return null;';
        }
    }

    // ── Utility Methods ──

    /**
     * Extract the main function name from source code based on language.
     */
    private extractFunctionName(code: string, language: string): string {
        switch (language) {
            case 'python': {
                const m = code.match(/def\s+(\w+)/);
                return m ? m[1] : '';
            }
            case 'java': {
                // Look for public static methods or class names
                const m = code.match(/class\s+(\w+)/);
                return m ? m[1] : '';
            }
            case 'cpp': {
                const m = code.match(/(?:TaskManager|void|int|string|auto)\s+(\w+)\s*\(/);
                return m ? m[1] : '';
            }
            case 'go': {
                const m = code.match(/func\s+(\w+)/);
                return m ? m[1] : '';
            }
            case 'rust': {
                const m = code.match(/fn\s+(\w+)/);
                return m ? m[1] : '';
            }
            case 'javascript':
            case 'typescript':
            default: {
                const m = code.match(/function\s+(\w+)/);
                return m ? m[1] : '';
            }
        }
    }

    // ── Literal Converters ──
    // Convert a JSON value to a language-specific literal string.

    private javaLiteral(val: any): string {
        if (typeof val === 'string') return `"${val}"`;
        if (typeof val === 'number') return String(val);
        if (typeof val === 'boolean') return String(val);
        if (Array.isArray(val)) {
            if (val.every(v => typeof v === 'number')) {
                return `new int[]{${val.join(', ')}}`;
            }
            return `new String[]{${val.map(v => `"${v}"`).join(', ')}}`;
        }
        return JSON.stringify(val);
    }

    private cppLiteral(val: any): string {
        if (typeof val === 'string') return `"${val}"`;
        if (typeof val === 'number') return String(val);
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (Array.isArray(val)) {
            if (val.every(v => typeof v === 'number')) {
                return `vector<int>{${val.join(', ')}}`;
            }
            return `vector<string>{${val.map(v => `"${v}"`).join(', ')}}`;
        }
        return JSON.stringify(val);
    }

    private goLiteral(val: any): string {
        if (typeof val === 'string') return `"${val}"`;
        if (typeof val === 'number') return String(val);
        if (typeof val === 'boolean') return String(val);
        if (Array.isArray(val)) {
            if (val.every(v => typeof v === 'number')) {
                return `[]int{${val.join(', ')}}`;
            }
            return `[]string{${val.map(v => `"${v}"`).join(', ')}}`;
        }
        return JSON.stringify(val);
    }

    private rustLiteral(val: any): string {
        if (typeof val === 'string') return `String::from("${val}")`;
        if (typeof val === 'number') return String(val);
        if (typeof val === 'boolean') return String(val);
        if (Array.isArray(val)) {
            if (val.every(v => typeof v === 'number')) {
                return `vec![${val.join(', ')}]`;
            }
            return `vec![${val.map(v => `String::from("${v}")`).join(', ')}]`;
        }
        return JSON.stringify(val);
    }

    /**
     * Strip require/import/export for sandboxed execution.
     */
    private cleanCode(code: string, language: string = 'javascript'): string {
        switch (language) {
            case 'javascript':
            case 'typescript':
                return code
                    .replace(/^(?:const|let|var)\s+\{[^}]+\}\s*=\s*require\([^)]+\);?\s*$/gm, '')
                    .replace(/^(?:const|let|var)\s+\w+\s*=\s*require\([^)]+\);?\s*$/gm, '')
                    .replace(/^module\.exports\s*=\s*\{[^}]*\};?\s*$/gm, '')
                    .replace(/^module\.exports\s*=\s*\w+;?\s*$/gm, '')
                    .replace(/^export\s+/gm, '')
                    .replace(/^import\s+.*$/gm, '');
            case 'python':
                // Remove relative imports but keep standard library imports
                return code
                    .replace(/^from\s+\.\w*\s+import\s+.*$/gm, '')
                    .replace(/^from\s+\w+\s+import\s+.*$/gm, (match) => {
                        // Keep standard lib imports like 'from typing import ...'
                        if (match.includes('typing') || match.includes('json') || match.includes('dataclasses')) return match;
                        return '';
                    });
            case 'java':
                // Remove package declarations (Judge0 wants default package)
                return code.replace(/^package\s+.*;\s*$/gm, '');
            case 'go':
                // Remove package and import declarations (we add our own)
                return code
                    .replace(/^package\s+\w+\s*$/gm, '')
                    .replace(/^import\s+\([\s\S]*?\)\s*$/gm, '')
                    .replace(/^import\s+"[^"]*"\s*$/gm, '');
            case 'rust':
                // Remove mod/use declarations for local modules
                return code
                    .replace(/^mod\s+\w+;\s*$/gm, '')
                    .replace(/^use\s+crate::\w+.*;\s*$/gm, '');
            default:
                return code;
        }
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
                (s) => s.status && s.status.id >= 3,
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

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
