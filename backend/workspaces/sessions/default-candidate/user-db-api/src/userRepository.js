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
        // TODO: call this.db.createTable with the table name 'users'
    }

    // Return an array of all users
    getAllUsers() {
        // TODO: return all rows from the 'users' table
    }

    // Return a single user by ID, or null if not found
    getUserById(id) {
        // TODO: return the user with the given id
    }

    // Insert a new user with { name, email } and return the created row
    addUser(name, email) {
        // TODO: insert a row into 'users' and return the result
    }

    // Update a user's data by ID, return the updated row or null
    updateUser(id, data) {
        // TODO: update the user with the given id
    }

    // Delete a user by ID, return true if deleted, false if not found
    deleteUser(id) {
        // TODO: delete the user with the given id
    }
}

module.exports = UserRepository;
