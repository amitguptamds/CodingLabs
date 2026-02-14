"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TaskManagerImpl {
    tasks = [];
    nextId = 1;
    addTask(title, priority) {
        return { id: 0, title: "", priority: "low", done: false };
    }
    completeTask(taskId) {
    }
    removeTask(taskId) {
    }
    listTasks() {
        return [];
    }
    filterByPriority(priority) {
        return [];
    }
}
function createTaskManager() {
    return new TaskManagerImpl();
}
//# sourceMappingURL=manager.js.map