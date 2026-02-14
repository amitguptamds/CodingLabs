/**
 * UserRepository -- CRUD operations for the 'users' table.
 *
 * You have access to this.db (a Database instance) with these methods:
 *   this.db.createTable(tableName)
 *   this.db.insert(tableName, { key: value, ... })
 *   this.db.findAll(tableName)
 *   this.db.findById(tableName, id)
 *   this.db.update(tableName, id, { key: value, ... })
 *   this.db.delete(tableName, id)
 *
 * Implement the methods below.
 */
class UserRepository {
    constructor(db) {
        this.db = db;
    }

    // Create the 'users' table
    initTable() {
        this.db.createTable('users');
    }

    // Return an array of all users
    getAllUsers() {
        return this.db.findAll('users');
    }

    // Return a single user by ID, or null if not found
    getUserById(id) {
        return this.db.findById('users', id);
    }

    // Insert a new user with { name, email } and return the created row
    addUser(name, email) {
        return this.db.insert('users', { name: name, email: email });
    }

    // Update a user's data by ID, return the updated row or null
    updateUser(id, data) {
        return this.db.update('users', id, data);
    }

    // Delete a user by ID, return true if deleted, false if not found
    deleteUser(id) {
        return this.db.delete('users', id);
    }
}

module.exports = UserRepository;
