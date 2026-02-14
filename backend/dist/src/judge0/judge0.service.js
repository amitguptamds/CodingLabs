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
const LANGUAGE_MAP = {
    javascript: 63,
    python: 71,
    java: 62,
    cpp: 54,
    typescript: 74,
    go: 60,
    rust: 73,
    c: 50,
    csharp: 51,
    ruby: 72,
    php: 68,
    kotlin: 78,
    swift: 83,
    bash: 46,
};
const ENTRY_POINTS = {
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
    getLanguageId(language) {
        return LANGUAGE_MAP[language] ?? LANGUAGE_MAP.javascript;
    }
    getEntryPoint(language) {
        return ENTRY_POINTS[language] ?? ENTRY_POINTS.javascript;
    }
    async executeCode(files, entryPoint, testCases, language = 'javascript') {
        const languageId = this.getLanguageId(language);
        const entryFile = files.find((f) => f.name === entryPoint);
        const otherFiles = files.filter((f) => f.name !== entryPoint);
        const combinedCode = [
            ...otherFiles.map((f) => this.cleanCode(f.content, language)),
            entryFile ? this.cleanCode(entryFile.content, language) : '',
        ].join('\n\n');
        const functionName = this.extractFunctionName(entryFile?.content ?? '', language);
        const submissions = testCases.map((tc) => {
            const fullSource = this.buildFullSource(combinedCode, functionName, tc, language);
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
    buildFullSource(combinedCode, functionName, tc, language) {
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
    buildJavaScriptSource(code, fn, input) {
        const scenarioId = input[0];
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
        return `${code}\n\nconst __result = ${fn}(${input.map(a => JSON.stringify(a)).join(', ')});\nconsole.log(JSON.stringify(__result));`;
    }
    buildPythonSource(code, fn, input) {
        const scenarioId = input[0];
        if (fn === 'create_task_manager') {
            return `${code}\n\n${this.pythonTaskManagerScenario(scenarioId)}`;
        }
        const args = input.map(a => JSON.stringify(a)).join(', ');
        return `import json\n${code}\nresult = ${fn}(${args})\nprint(json.dumps(result))`;
    }
    buildJavaSource(code, fn, input) {
        const scenarioId = input[0];
        if (fn === 'createTaskManager') {
            return this.javaTaskManagerScenario(code, scenarioId);
        }
        return code;
    }
    buildCppSource(code, fn, input) {
        const scenarioId = input[0];
        if (fn === 'createTaskManager') {
            return this.cppTaskManagerScenario(code, scenarioId);
        }
        return code;
    }
    buildTypeScriptSource(code, fn, input) {
        const scenarioId = input[0];
        if (fn === 'createTaskManager') {
            return `${code}\n\nconst __result = (() => {\n  ${this.tsTaskManagerScenario(scenarioId)}\n})();\nconsole.log(JSON.stringify(__result));`;
        }
        const args = input.map(a => JSON.stringify(a)).join(', ');
        return `${code}\n\nconst __result = ${fn}(${args});\nconsole.log(JSON.stringify(__result));`;
    }
    buildGoSource(code, fn, input) {
        const scenarioId = input[0];
        if (fn === 'createTaskManager') {
            return this.goTaskManagerScenario(code, scenarioId);
        }
        return code;
    }
    buildRustSource(code, fn, input) {
        const scenarioId = input[0];
        if (fn === 'createTaskManager') {
            return this.rustTaskManagerScenario(code, scenarioId);
        }
        return code;
    }
    jsTaskManagerScenario(scenario) {
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
    pythonTaskManagerScenario(scenario) {
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
    javaTaskManagerScenario(userCode, scenario) {
        let testBody;
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
    cppTaskManagerScenario(userCode, scenario) {
        let testBody;
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
    tsTaskManagerScenario(scenario) {
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
    goTaskManagerScenario(userCode, scenario) {
        let testBody;
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
    rustTaskManagerScenario(userCode, scenario) {
        let testBody;
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
    eventEmitterScenario(scenario) {
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
    greetingSystemScenario(scenario) {
        switch (scenario) {
            case 'basic-greet': return `var sys = createGreeter(); return sys.greet("world");`;
            case 'multi-greet': return `var sys = createGreeter(); return sys.greetMultiple(["alice", "bob"]);`;
            case 'empty-string': return `var sys = createGreeter(); return sys.greet("");`;
            case 'get-greeter': return `var sys = createGreeter(); return typeof sys.greeter === "object" && typeof sys.greeter.greet === "function";`;
            case 'already-capitalized': return `var sys = createGreeter(); return sys.greet("Alice");`;
            default: return 'return null;';
        }
    }
    todoAppScenario(scenario) {
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
    userApiScenario(scenario) {
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
    extractFunctionName(code, language) {
        switch (language) {
            case 'python': {
                const m = code.match(/def\s+(\w+)/);
                return m ? m[1] : '';
            }
            case 'java': {
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
    cleanCode(code, language = 'javascript') {
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
                return code
                    .replace(/^from\s+\.\w*\s+import\s+.*$/gm, '')
                    .replace(/^from\s+\w+\s+import\s+.*$/gm, (match) => {
                    if (match.includes('typing') || match.includes('json') || match.includes('dataclasses'))
                        return match;
                    return '';
                });
            case 'java':
                return code.replace(/^package\s+.*;\s*$/gm, '');
            case 'go':
                return code
                    .replace(/^package\s+\w+\s*$/gm, '')
                    .replace(/^import\s+\([\s\S]*?\)\s*$/gm, '')
                    .replace(/^import\s+"[^"]*"\s*$/gm, '');
            case 'rust':
                return code
                    .replace(/^mod\s+\w+;\s*$/gm, '')
                    .replace(/^use\s+crate::\w+.*;\s*$/gm, '');
            default:
                return code;
        }
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