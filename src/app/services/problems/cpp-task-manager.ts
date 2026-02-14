import { Problem } from '../../models/problem.model';

export const cppTaskManager: Problem = {
    id: 'cpp-task-manager',
    title: 'Task Manager (C++)',
    description: `Build a **Task Manager** in C++ using structs and vectors.

Implement the \`TaskManager\` class with methods to add, complete, remove, list, and filter tasks by priority.

Your task:
- **\`addTask(title, priority)\`** — Create and return a new Task
- **\`completeTask(taskId)\`** — Mark a task as done
- **\`removeTask(taskId)\`** — Remove a task
- **\`listTasks()\`** — Return all tasks
- **\`filterByPriority(priority)\`** — Filter tasks`,
    difficulty: 'Easy',
    tags: ['C++', 'Structs', 'Multi-File'],
    isMultiFile: true,
    language: 'cpp',
    files: [
        {
            name: 'task_manager.cpp',
            path: 'task_manager.cpp',
            language: 'cpp',
            content: `#include <vector>
#include <string>
#include <algorithm>

struct Task {
    int id;
    std::string title;
    std::string priority;
    bool done;
    Task(int i, const std::string& t, const std::string& p) : id(i), title(t), priority(p), done(false) {}
};

class TaskManager {
private:
    std::vector<Task> tasks;
    int nextId = 1;

public:
    Task addTask(const std::string& title, const std::string& priority) {
        // TODO: Create a new Task, add to tasks vector, increment nextId
        return Task(0, "", "");
    }

    void completeTask(int taskId) {
        // TODO: Find task by id and set done = true
    }

    void removeTask(int taskId) {
        // TODO: Remove task by id from tasks vector
    }

    std::vector<Task> listTasks() {
        // TODO: Return all tasks
        return {};
    }

    std::vector<Task> filterByPriority(const std::string& priority) {
        // TODO: Return tasks matching the given priority
        return {};
    }
};
`
        },
    ],
    boilerplateCode: `// Multi-file problem — edit task_manager.cpp
class TaskManager {
    Task addTask(const string& title, const string& priority) {
        // TODO: implement
    }
};`,
    solutionTemplate: 'createTaskManager',
    examples: [
        { input: 'tm.addTask("Buy milk", "high")', output: '{"id":1,"title":"Buy milk","priority":"high","done":false}', explanation: 'Creates a new task with id 1' },
        { input: 'tm.listTasks()', output: '[Task{...}]' },
    ],
    constraints: [
        'Tasks must have auto-incrementing integer IDs starting at 1',
        'Priority must be one of: "low", "medium", "high"',
        'Use std::vector for storage',
    ],
    testCases: [
        { id: 1, input: JSON.stringify(['add-task']), expectedOutput: JSON.stringify({ id: 1, title: 'Buy milk', priority: 'high', done: false }), isHidden: false },
        { id: 2, input: JSON.stringify(['list-tasks']), expectedOutput: JSON.stringify(['A', 'B']), isHidden: false },
        { id: 3, input: JSON.stringify(['complete-task']), expectedOutput: JSON.stringify({ done: true }), isHidden: false },
        { id: 4, input: JSON.stringify(['remove-task']), expectedOutput: JSON.stringify({ count: 1 }), isHidden: true },
        { id: 5, input: JSON.stringify(['filter-by-priority']), expectedOutput: JSON.stringify({ count: 2 }), isHidden: true },
    ]
};
