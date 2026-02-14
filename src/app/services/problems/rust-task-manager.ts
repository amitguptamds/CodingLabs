import { Problem } from '../../models/problem.model';

export const rustTaskManager: Problem = {
    id: 'rust-task-manager',
    title: 'Task Manager (Rust)',
    description: `Build a **Task Manager** in Rust using structs and Vec.

Implement the \`TaskManager\` struct with methods to add, complete, remove, list, and filter tasks by priority.

Your task:
- **\`add_task(title, priority)\`** — Create and return a new Task
- **\`complete_task(task_id)\`** — Mark a task as done
- **\`remove_task(task_id)\`** — Remove a task
- **\`list_tasks()\`** — Return all tasks
- **\`filter_by_priority(priority)\`** — Filter tasks`,
    difficulty: 'Easy',
    tags: ['Rust', 'Structs', 'Multi-File'],
    isMultiFile: true,
    language: 'rust',
    files: [
        {
            name: 'task_manager.rs',
            path: 'task_manager.rs',
            language: 'rust',
            content: `#[derive(Clone)]
struct Task {
    id: i32,
    title: String,
    priority: String,
    done: bool,
}

struct TaskManager {
    tasks: Vec<Task>,
    next_id: i32,
}

impl TaskManager {
    fn new() -> Self {
        TaskManager {
            tasks: Vec::new(),
            next_id: 1,
        }
    }

    fn add_task(&mut self, title: String, priority: String) -> Task {
        // TODO: Create a new Task, push to tasks, increment next_id
        Task { id: 0, title: String::new(), priority: String::new(), done: false }
    }

    fn complete_task(&mut self, task_id: i32) {
        // TODO: Find task by id and set done = true
    }

    fn remove_task(&mut self, task_id: i32) {
        // TODO: Remove task by id from tasks Vec
    }

    fn list_tasks(&self) -> &Vec<Task> {
        // TODO: Return reference to all tasks
        &self.tasks
    }

    fn filter_by_priority(&self, priority: &str) -> Vec<&Task> {
        // TODO: Return tasks matching the given priority
        Vec::new()
    }
}
`
        },
    ],
    boilerplateCode: `// Multi-file problem — edit task_manager.rs
impl TaskManager {
    fn add_task(&mut self, title: String, priority: String) -> Task {
        // TODO: implement
    }
}`,
    solutionTemplate: 'createTaskManager',
    examples: [
        { input: 'tm.add_task("Buy milk", "high")', output: '{"id":1,"title":"Buy milk","priority":"high","done":false}', explanation: 'Creates a new task with id 1' },
        { input: 'tm.list_tasks()', output: '[Task{...}]' },
    ],
    constraints: [
        'Tasks must have auto-incrementing i32 IDs starting at 1',
        'Priority must be one of: "low", "medium", "high"',
        'Use Vec<Task> for storage',
        'Return clones where ownership is needed',
    ],
    testCases: [
        { id: 1, input: JSON.stringify(['add-task']), expectedOutput: JSON.stringify({ id: 1, title: 'Buy milk', priority: 'high', done: false }), isHidden: false },
        { id: 2, input: JSON.stringify(['list-tasks']), expectedOutput: JSON.stringify(['A', 'B']), isHidden: false },
        { id: 3, input: JSON.stringify(['complete-task']), expectedOutput: JSON.stringify({ done: true }), isHidden: false },
        { id: 4, input: JSON.stringify(['remove-task']), expectedOutput: JSON.stringify({ count: 1 }), isHidden: true },
        { id: 5, input: JSON.stringify(['filter-by-priority']), expectedOutput: JSON.stringify({ count: 2 }), isHidden: true },
    ]
};
