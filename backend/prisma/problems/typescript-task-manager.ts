export const typescriptTaskManager = {
    id: 'typescript-task-manager',
    title: 'Task Manager (TypeScript)',
    description: 'Build a **Task Manager** in TypeScript using interfaces and typed arrays.\\n\\nImplement the `TaskManager` class with methods to add, complete, remove, list, and filter tasks by priority.\\n\\nUse proper TypeScript types throughout.',
    difficulty: 'Easy',
    tags: ['TypeScript', 'Interfaces', 'Multi-File'],
    isMultiFile: true,
    language: 'typescript',
    boilerplateCode: '// Multi-file problem — edit manager.ts in the editor.',
    solutionTemplate: 'createTaskManager',
    templateFiles: [
        {
            name: 'types.ts',
            path: 'types.ts',
            language: 'typescript',
            content: `interface Task {
    id: number;
    title: string;
    priority: "low" | "medium" | "high";
    done: boolean;
}
`,
        },
        {
            name: 'manager.ts',
            path: 'manager.ts',
            language: 'typescript',
            content: `interface Task {
    id: number;
    title: string;
    priority: "low" | "medium" | "high";
    done: boolean;
}

class TaskManagerImpl {
    private tasks: Task[] = [];
    private nextId: number = 1;

    addTask(title: string, priority: "low" | "medium" | "high"): Task {
        // TODO: Create a new Task, push to tasks, increment nextId
        // Return the created task
        return { id: 0, title: "", priority: "low", done: false };
    }

    completeTask(taskId: number): void {
        // TODO: Find task by id and set done = true
    }

    removeTask(taskId: number): void {
        // TODO: Remove task by id from tasks
    }

    listTasks(): Task[] {
        // TODO: Return all tasks
        return [];
    }

    filterByPriority(priority: string): Task[] {
        // TODO: Return tasks matching the given priority
        return [];
    }
}

function createTaskManager() {
    return new TaskManagerImpl();
}
`,
        },
    ],
    testCases: [
        { id: 1, input: JSON.stringify(['add-task']), expectedOutput: JSON.stringify({ id: 1, title: 'Buy milk', priority: 'high', done: false }), isHidden: false },
        { id: 2, input: JSON.stringify(['list-tasks']), expectedOutput: JSON.stringify(['A', 'B']), isHidden: false },
        { id: 3, input: JSON.stringify(['complete-task']), expectedOutput: JSON.stringify({ done: true }), isHidden: false },
        { id: 4, input: JSON.stringify(['remove-task']), expectedOutput: JSON.stringify({ count: 1 }), isHidden: true },
        { id: 5, input: JSON.stringify(['filter-by-priority']), expectedOutput: JSON.stringify({ count: 2 }), isHidden: true },
    ],
    examples: [
        { input: 'tm.addTask("Buy milk", "high")', output: '{"id":1,"title":"Buy milk","priority":"high","done":false}', explanation: 'Creates a new task with id 1' },
        { input: 'tm.listTasks()', output: '[{...}, {...}]' },
    ],
    constraints: [
        'Tasks must have auto-incrementing integer IDs starting at 1',
        'Priority must be typed as union: "low" | "medium" | "high"',
        'Use proper TypeScript typing throughout',
    ],
};
