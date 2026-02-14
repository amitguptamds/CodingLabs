/**
 * Todo Service — CRUD operations on a todo list
 * Methods: addTodo(todo), removeTodo(id), toggleTodo(id),
 *          getTodos(), filterByStatus(completed)
 */
function createTodoService() {
    const todos = [];

    return {
        addTodo(todo) {
            // Add a todo to the list
        },
        removeTodo(id) {
            // Remove a todo by id, return true if found
        },
        toggleTodo(id) {
            // Toggle completed status, return the updated todo or null
        },
        getTodos() {
            // Return all todos
        },
        filterByStatus(completed) {
            // Return todos filtered by completed status
        }
    };
}
