public class Task {
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
