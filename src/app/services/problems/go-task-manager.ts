import { Problem } from '../../models/problem.model';

export const goTaskManager: Problem = {
    id: 'go-task-manager',
    title: 'Task Manager (Go)',
    description: `Build a **Task Manager** in Go using structs and slices.

Implement the \`TaskManager\` struct with methods to add, complete, remove, list, and filter tasks by priority.

Your task:
- **\`AddTask(title, priority)\`** — Create and return a new Task
- **\`CompleteTask(id)\`** — Mark a task as done
- **\`RemoveTask(id)\`** — Remove a task
- **\`ListTasks()\`** — Return all tasks
- **\`FilterByPriority(priority)\`** — Filter tasks`,
    difficulty: 'Easy',
    tags: ['Go', 'Structs', 'Multi-File'],
    isMultiFile: true,
    language: 'go',
    files: [
        {
            name: 'task_manager.go',
            path: 'task_manager.go',
            language: 'go',
            content: `type Task struct {
\tID       int
\tTitle    string
\tPriority string
\tDone     bool
}

type TaskManager struct {
\tTasks  []Task
\tnextID int
}

func NewTaskManager() *TaskManager {
\treturn &TaskManager{nextID: 1}
}

func (tm *TaskManager) AddTask(title, priority string) Task {
\t// TODO: Create a new Task, append to Tasks, increment nextID
\treturn Task{}
}

func (tm *TaskManager) CompleteTask(id int) {
\t// TODO: Find task by id and set Done = true
}

func (tm *TaskManager) RemoveTask(id int) {
\t// TODO: Remove task by id from Tasks slice
}

func (tm *TaskManager) ListTasks() []Task {
\t// TODO: Return all tasks
\treturn nil
}

func (tm *TaskManager) FilterByPriority(priority string) []Task {
\t// TODO: Return tasks matching the given priority
\treturn nil
}
`
        },
    ],
    boilerplateCode: `// Multi-file problem — edit task_manager.go
func (tm *TaskManager) AddTask(title, priority string) Task {
    // TODO: implement
    return Task{}
}`,
    solutionTemplate: 'createTaskManager',
    examples: [
        { input: 'tm.AddTask("Buy milk", "high")', output: '{"id":1,"title":"Buy milk","priority":"high","done":false}', explanation: 'Creates a new task with ID 1' },
        { input: 'tm.ListTasks()', output: '[Task{...}]' },
    ],
    constraints: [
        'Tasks must have auto-incrementing integer IDs starting at 1',
        'Priority must be one of: "low", "medium", "high"',
        'Use Go slices for storage',
    ],
    testCases: [
        { id: 1, input: JSON.stringify(['add-task']), expectedOutput: JSON.stringify({ id: 1, title: 'Buy milk', priority: 'high', done: false }), isHidden: false },
        { id: 2, input: JSON.stringify(['list-tasks']), expectedOutput: JSON.stringify(['A', 'B']), isHidden: false },
        { id: 3, input: JSON.stringify(['complete-task']), expectedOutput: JSON.stringify({ done: true }), isHidden: false },
        { id: 4, input: JSON.stringify(['remove-task']), expectedOutput: JSON.stringify({ count: 1 }), isHidden: true },
        { id: 5, input: JSON.stringify(['filter-by-priority']), expectedOutput: JSON.stringify({ count: 2 }), isHidden: true },
    ]
};
