class TaskManager:
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
