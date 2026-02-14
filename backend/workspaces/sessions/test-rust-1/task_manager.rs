#[derive(Clone)]
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
        // Return a clone of the created task
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
