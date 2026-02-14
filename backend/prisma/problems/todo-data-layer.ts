export const todoDataLayer = {
    id: 'todo-data-layer',
    title: 'Todo App Data Layer',
    description: 'Build a **todo application data layer** with validation and filtering across multiple files.',
    difficulty: 'Medium',
    tags: ['Data Layer', 'Validation', 'Multi-File'],
    isMultiFile: true,
    boilerplateCode: '// Multi-file problem — edit all files in the editor.',
    solutionTemplate: 'createTodoApp',
    templateFiles: [
        {
            name: 'todoStore.js',
            path: 'src/todoStore.js',
            language: 'javascript',
            content: '/**\n * Todo Store — manages the todo list array.\n */\nclass TodoStore {\n  constructor() {\n    this.todos = [];\n    this.nextId = 1;\n  }\n\n  add(title, priority) {\n    // Add a todo and return it\n  }\n\n  remove(id) {\n    // Remove a todo by id, return true/false\n  }\n\n  toggle(id) {\n    // Toggle completed status, return updated todo\n  }\n\n  getAll() {\n    // Return all todos\n  }\n}\n',
        },
        {
            name: 'validator.js',
            path: 'src/validator.js',
            language: 'javascript',
            content: '/**\n * Validator — validates todo input before it reaches the store.\n */\nclass TodoValidator {\n  validate(title, priority) {\n    // Return { valid: boolean, errors: string[] }\n    // Rules: title must be non-empty string, priority must be "low"|"medium"|"high"\n  }\n}\n',
        },
        {
            name: 'index.js',
            path: 'src/index.js',
            language: 'javascript',
            content: '/**\n * Create the todo app facade.\n * createTodoApp() returns { add, remove, toggle, list, listCompleted, listPending }\n */\nfunction createTodoApp() {\n  // Wire TodoStore + TodoValidator together\n  // Return public API\n}\n',
        },
    ],
    testCases: [
        { id: 1, input: JSON.stringify(['add-valid']), expectedOutput: JSON.stringify({ success: true, hasId: true, title: 'Buy milk', priority: 'high', completed: false }), isHidden: false },
        { id: 2, input: JSON.stringify(['add-invalid-empty']), expectedOutput: JSON.stringify({ success: false, hasErrors: true }), isHidden: false },
        { id: 3, input: JSON.stringify(['toggle']), expectedOutput: JSON.stringify({ completed: true }), isHidden: false },
        { id: 4, input: JSON.stringify(['filter']), expectedOutput: JSON.stringify({ completed: 1, pending: 1 }), isHidden: false },
        { id: 5, input: JSON.stringify(['add-invalid-priority']), expectedOutput: JSON.stringify({ success: false, hasErrors: true }), isHidden: true },
        { id: 6, input: JSON.stringify(['remove']), expectedOutput: JSON.stringify({ removed: true, remaining: 1 }), isHidden: true },
    ],
    examples: [
        { input: 'add("Buy milk", "high")', output: '{ success: true, todo: { id: 1, title: "Buy milk", ... } }' },
    ],
    constraints: [
        'Title must be a non-empty string',
        'Priority must be "low", "medium", or "high"',
    ],
};
