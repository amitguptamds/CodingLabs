import { Problem } from '../../models/problem.model';

export const todoDataLayer: Problem = {
    id: 'todo-data-layer',
    title: 'Todo App Data Layer',
    description: `Build a complete **data layer** for a Todo application across multiple files.

Implement the following modules:
- **\`todoModel.js\`** — Factory function \`createTodo(title, priority)\` that creates todo objects with \`id\`, \`title\`, \`priority\`, \`completed\`, and \`createdAt\` fields
- **\`validator.js\`** — Validation functions: \`validateTodo(todo)\` returns \`{ valid, errors[] }\`  
- **\`todoService.js\`** — Service with \`addTodo\`, \`removeTodo\`, \`toggleTodo\`, \`getTodos\`, and \`filterByStatus\` methods
- **\`index.js\`** — Facade that wires everything together and exports a \`createTodoApp()\` function

The returned app object should have methods: \`add(title, priority)\`, \`remove(id)\`, \`toggle(id)\`, \`list()\`, \`listCompleted()\`, \`listPending()\`.`,
    difficulty: 'Hard',
    tags: ['System Design', 'Architecture', 'Multi-File'],
    isMultiFile: true,
    files: [
        {
            name: 'todoModel.js',
            path: 'src/todoModel.js',
            language: 'javascript',
            content: `/**
 * Todo Model Factory
 * createTodo(title, priority) -> { id, title, priority, completed, createdAt }
 * priority: "low" | "medium" | "high"
 */
let nextId = 1;

function createTodo(title, priority) {
  // Return a new todo object with auto-incrementing id
}
`
        },
        {
            name: 'validator.js',
            path: 'src/validator.js',
            language: 'javascript',
            content: `/**
 * Validation functions for Todo items
 * validateTodo({ title, priority }) -> { valid: boolean, errors: string[] }
 *
 * Rules:
 * - title is required and must be a non-empty string
 * - title must be at most 100 characters
 * - priority must be one of: "low", "medium", "high"
 */
function validateTodo(data) {
  // Validate and return { valid, errors }
}
`
        },
        {
            name: 'todoService.js',
            path: 'src/todoService.js',
            language: 'javascript',
            content: `/**
 * Todo Service — CRUD operations on a todo list
 * Methods: addTodo(todo), removeTodo(id), toggleTodo(id),
 *          getTodos(), filterByStatus(completed)
 */
function createTodoService() {
  const todos = [];

  return {
    addTodo(todo) {
      // Add a todo to the list
    },
    removeTodo(id) {
      // Remove a todo by id, return true if found
    },
    toggleTodo(id) {
      // Toggle completed status, return the updated todo or null
    },
    getTodos() {
      // Return all todos
    },
    filterByStatus(completed) {
      // Return todos filtered by completed status
    }
  };
}
`
        },
        {
            name: 'index.js',
            path: 'src/index.js',
            language: 'javascript',
            content: `/**
 * Todo App Facade
 * createTodoApp() returns { add, remove, toggle, list, listCompleted, listPending }
 *
 * add(title, priority) — validates, creates, and adds a todo. Returns { success, todo?, errors? }
 * remove(id) — removes by id. Returns boolean.
 * toggle(id) — toggles completed. Returns updated todo or null.
 * list() — returns all todos
 * listCompleted() — returns completed todos
 * listPending() — returns pending todos
 */
function createTodoApp() {
  // Wire together todoModel, validator, and todoService
}
`
        }
    ],
    boilerplateCode: `// This is a multi-file problem. Edit all files in the VSCode editor.
// Main entry: index.js
function createTodoApp() {
  // Wire together todoModel, validator, and todoService
}`,
    solutionTemplate: 'createTodoApp',
    examples: [
        {
            input: 'app.add("Buy milk", "high")',
            output: '{ success: true, todo: { id: 1, title: "Buy milk", priority: "high", completed: false } }',
            explanation: 'Adding a valid todo returns success with the created todo object.'
        },
        {
            input: 'app.add("", "high")',
            output: '{ success: false, errors: ["Title is required"] }',
            explanation: 'Adding a todo with an empty title returns validation errors.'
        }
    ],
    constraints: [
        'Each todo must have a unique auto-incrementing id',
        'Validation must run before adding a todo',
        'priority must be one of: "low", "medium", "high"',
        'title must be non-empty and at most 100 characters',
        'toggle must return the updated todo or null if not found',
        'remove must return true if removed, false if not found'
    ],
    testCases: [
        {
            id: 1,
            input: JSON.stringify(["add-valid"]),
            expectedOutput: JSON.stringify({ success: true, hasId: true, title: "Buy milk", priority: "high", completed: false }),
            isHidden: false
        },
        {
            id: 2,
            input: JSON.stringify(["add-invalid-empty"]),
            expectedOutput: JSON.stringify({ success: false, hasErrors: true }),
            isHidden: false
        },
        {
            id: 3,
            input: JSON.stringify(["add-invalid-priority"]),
            expectedOutput: JSON.stringify({ success: false, hasErrors: true }),
            isHidden: false
        },
        {
            id: 4,
            input: JSON.stringify(["toggle"]),
            expectedOutput: JSON.stringify({ completed: true }),
            isHidden: false
        },
        {
            id: 5,
            input: JSON.stringify(["filter"]),
            expectedOutput: JSON.stringify({ completed: 1, pending: 1 }),
            isHidden: true
        },
        {
            id: 6,
            input: JSON.stringify(["remove"]),
            expectedOutput: JSON.stringify({ removed: true, remaining: 1 }),
            isHidden: true
        }
    ]
};
