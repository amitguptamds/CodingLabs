#include <vector>
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
        // Return the created task
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
