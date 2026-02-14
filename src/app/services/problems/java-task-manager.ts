import { Problem } from '../../models/problem.model';

export const javaTaskManager: Problem = {
    id: 'java-task-manager',
    title: 'Task Manager (Java)',
    description: `Build a **Task Manager** in Java using classes and ArrayList.

Implement the \`TaskManager\` class with methods to add, complete, remove, list, and filter tasks by priority.

Your task:
- **\`addTask(title, priority)\`** — Create and return a new Task
- **\`completeTask(taskId)\`** — Mark a task as done
- **\`removeTask(taskId)\`** — Remove a task
- **\`listTasks()\`** — Return all tasks
- **\`filterByPriority(priority)\`** — Filter tasks`,
    difficulty: 'Easy',
    tags: ['Java', 'OOP', 'Multi-File'],
    isMultiFile: true,
    language: 'java',
    files: [
        {
            name: 'Task.java',
            path: 'Task.java',
            language: 'java',
            content: `public class Task {
    public int id;
    public String title;
    public String priority;
    public boolean done;

    public Task(int id, String title, String priority) {
        this.id = id;
        this.title = title;
        this.priority = priority;
        this.done = false;
    }
}
`
        },
        {
            name: 'TaskManager.java',
            path: 'TaskManager.java',
            language: 'java',
            content: `import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class TaskManager {
    private List<Task> tasks = new ArrayList<>();
    private int nextId = 1;

    public Task addTask(String title, String priority) {
        // TODO: Create a new Task, add to tasks list, increment nextId
        return null;
    }

    public void completeTask(int taskId) {
        // TODO: Find task by id and set done = true
    }

    public void removeTask(int taskId) {
        // TODO: Remove task by id from tasks list
    }

    public List<Task> listTasks() {
        // TODO: Return all tasks
        return null;
    }

    public List<Task> filterByPriority(String priority) {
        // TODO: Return tasks matching the given priority
        return null;
    }
}
`
        },
    ],
    boilerplateCode: `// Multi-file problem — edit TaskManager.java
public class TaskManager {
    public Task addTask(String title, String priority) {
        // TODO: implement
        return null;
    }
}`,
    solutionTemplate: 'createTaskManager',
    examples: [
        { input: 'tm.addTask("Buy milk", "high")', output: '{"id":1,"title":"Buy milk","priority":"high","done":false}', explanation: 'Creates a new task with id 1' },
        { input: 'tm.listTasks()', output: '[Task{...}]' },
    ],
    constraints: [
        'Tasks must have auto-incrementing integer IDs starting at 1',
        'Priority must be one of: "low", "medium", "high"',
        'Use ArrayList for storage',
    ],
    testCases: [
        { id: 1, input: JSON.stringify(['add-task']), expectedOutput: JSON.stringify({ id: 1, title: 'Buy milk', priority: 'high', done: false }), isHidden: false },
        { id: 2, input: JSON.stringify(['list-tasks']), expectedOutput: JSON.stringify(['A', 'B']), isHidden: false },
        { id: 3, input: JSON.stringify(['complete-task']), expectedOutput: JSON.stringify({ done: true }), isHidden: false },
        { id: 4, input: JSON.stringify(['remove-task']), expectedOutput: JSON.stringify({ count: 1 }), isHidden: true },
        { id: 5, input: JSON.stringify(['filter-by-priority']), expectedOutput: JSON.stringify({ count: 2 }), isHidden: true },
    ]
};
