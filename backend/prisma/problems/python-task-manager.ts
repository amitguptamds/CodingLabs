export const pythonTaskManager = {
    id: 'python-task-manager',
    title: 'Task Manager (Python)',
    description: 'Build a **Task Manager** in Python using classes and dictionaries.\\n\\nImplement the `TaskManager` class with methods to add, complete, remove, list, and filter tasks by priority.\\n\\nThe `create_task_manager()` factory function wires everything together.',
    difficulty: 'Easy',
    tags: ['Python', 'Classes', 'Multi-File'],
    isMultiFile: true,
    language: 'python',
    boilerplateCode: '# Multi-file problem — edit task.py in the editor.',
    solutionTemplate: 'create_task_manager',
    templateFiles: [
        {
            name: 'task.py',
            path: 'task.py',
            language: 'python',
            content: `class Task:
    """Represents a single task."""
    def __init__(self, id: int, title: str, priority: str):
        self.id = id
        self.title = title
        self.priority = priority
        self.done = False

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "priority": self.priority,
            "done": self.done
        }
`,
        },
        {
            name: 'manager.py',
            path: 'manager.py',
            language: 'python',
            content: `class TaskManager:
    """Manages a collection of tasks."""
    def __init__(self):
        self.tasks = []
        self.next_id = 1

    def add_task(self, title: str, priority: str) -> dict:
        # TODO: Create a new Task, append to self.tasks, increment next_id
        # Return the task as a dict using to_dict()
        pass

    def complete_task(self, task_id: int):
        # TODO: Find task by id and set done = True
        pass

    def remove_task(self, task_id: int):
        # TODO: Remove task by id from self.tasks
        pass

    def list_tasks(self) -> list:
        # TODO: Return all tasks as list of dicts
        pass

    def filter_by_priority(self, priority: str) -> list:
        # TODO: Return tasks matching the given priority as list of dicts
        pass
`,
        },
        {
            name: 'main.py',
            path: 'main.py',
            language: 'python',
            content: `from task import Task
from manager import TaskManager

def create_task_manager():
    """Factory function that returns a TaskManager instance."""
    return TaskManager()
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
        { input: 'tm.add_task("Buy milk", "high")', output: '{"id": 1, "title": "Buy milk", "priority": "high", "done": false}', explanation: 'Creates a new task with id 1' },
        { input: 'tm.list_tasks()', output: '[{"id": 1, ...}, {"id": 2, ...}]', explanation: 'Returns all tasks as dicts' },
    ],
    constraints: [
        'Tasks must have auto-incrementing integer IDs starting at 1',
        'Priority must be one of: "low", "medium", "high"',
        'All return values must be dicts (not Task objects)',
    ],
};
