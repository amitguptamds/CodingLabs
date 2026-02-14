import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class TaskManager {
    private List<Task> tasks = new ArrayList<>();
    private int nextId = 1;

    public Task addTask(String title, String priority) {
        // TODO: Create a new Task, add to tasks list, increment nextId
        // Return the created task
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
