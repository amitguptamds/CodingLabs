interface Task {
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
