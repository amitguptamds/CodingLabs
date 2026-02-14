class Task:
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
