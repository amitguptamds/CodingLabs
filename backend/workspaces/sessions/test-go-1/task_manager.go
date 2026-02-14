type Task struct {
	ID       int
	Title    string
	Priority string
	Done     bool
}

type TaskManager struct {
	Tasks  []Task
	nextID int
}

func NewTaskManager() *TaskManager {
	return &TaskManager{nextID: 1}
}

func (tm *TaskManager) AddTask(title, priority string) Task {
	// TODO: Create a new Task, append to Tasks, increment nextID
	// Return the created task
	return Task{}
}

func (tm *TaskManager) CompleteTask(id int) {
	// TODO: Find task by id and set Done = true
}

func (tm *TaskManager) RemoveTask(id int) {
	// TODO: Remove task by id from Tasks slice
}

func (tm *TaskManager) ListTasks() []Task {
	// TODO: Return all tasks
	return nil
}

func (tm *TaskManager) FilterByPriority(priority string) []Task {
	// TODO: Return tasks matching the given priority
	return nil
}
