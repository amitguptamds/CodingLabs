import { Problem } from '../../models/problem.model';

export const userDbApi: Problem = {
    id: 'user-db-api',
    title: 'User Database API',
    description: `Build a **user repository** on top of an in-memory database.

An in-memory \`Database\` class is provided that simulates SQLite-like storage with auto-increment IDs. The \`index.js\` wiring is already done for you.

Your task: implement the **UserRepository** methods in \`userRepository.js\`:
- \`initTable()\` -- create the 'users' table
- \`getAllUsers()\` -- return all users
- \`getUserById(id)\` -- return a user by ID, or null
- \`addUser(name, email)\` -- insert a user, return the created row
- \`updateUser(id, data)\` -- update a user, return updated row or null
- \`deleteUser(id)\` -- delete a user, return true/false

Each method maps to a single \`this.db\` method call. Check the DB API in \`database.js\`.`,
    difficulty: 'Medium',
    tags: ['Database', 'CRUD', 'Multi-File'],
    isMultiFile: true,
    files: [
        {
            name: 'database.js',
            path: 'src/database.js',
            language: 'javascript',
            content: `/**
 * In-Memory Database -- simulates SQLite-like storage.
 *
 * API:
 *   db.createTable(tableName)      -- create an empty table with auto-increment id
 *   db.insert(tableName, row)      -- insert a row, returns { id, ...row }
 *   db.findAll(tableName)          -- return all rows
 *   db.findById(tableName, id)     -- return one row or null
 *   db.update(tableName, id, data) -- update a row, returns updated row or null
 *   db.delete(tableName, id)       -- delete a row, returns true/false
 */
class Database {
    constructor() {
        this.tables = {};
        this.sequences = {};
    }

    createTable(tableName) {
        if (this.tables[tableName]) {
            throw new Error("Table '" + tableName + "' already exists");
        }
        this.tables[tableName] = [];
        this.sequences[tableName] = 1;
    }

    insert(tableName, row) {
        var table = this.tables[tableName];
        if (!table) throw new Error("Table '" + tableName + "' does not exist");
        var id = this.sequences[tableName]++;
        var newRow = Object.assign({ id: id }, row);
        table.push(newRow);
        return Object.assign({}, newRow);
    }

    findAll(tableName) {
        var table = this.tables[tableName];
        if (!table) throw new Error("Table '" + tableName + "' does not exist");
        return table.map(function(r) { return Object.assign({}, r); });
    }

    findById(tableName, id) {
        var table = this.tables[tableName];
        if (!table) throw new Error("Table '" + tableName + "' does not exist");
        var row = null;
        for (var i = 0; i < table.length; i++) {
            if (table[i].id === id) { row = table[i]; break; }
        }
        return row ? Object.assign({}, row) : null;
    }

    update(tableName, id, data) {
        var table = this.tables[tableName];
        if (!table) throw new Error("Table '" + tableName + "' does not exist");
        for (var i = 0; i < table.length; i++) {
            if (table[i].id === id) {
                Object.assign(table[i], data);
                return Object.assign({}, table[i]);
            }
        }
        return null;
    }

    delete(tableName, id) {
        var table = this.tables[tableName];
        if (!table) throw new Error("Table '" + tableName + "' does not exist");
        for (var i = 0; i < table.length; i++) {
            if (table[i].id === id) {
                table.splice(i, 1);
                return true;
            }
        }
        return false;
    }
}

module.exports = Database;
`
        },
        {
            name: 'userRepository.js',
            path: 'src/userRepository.js',
            language: 'javascript',
            content: `/**
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
`
        },
        {
            name: 'index.js',
            path: 'src/index.js',
            language: 'javascript',
            content: `var Database = require('./database');
var UserRepository = require('./userRepository');

/**
 * Wire the Database and UserRepository together.
 * createUserApi() returns an object with repository methods.
 */
function createUserApi() {
    var db = new Database();
    var repo = new UserRepository(db);
    repo.initTable();

    return {
        db: db,
        repo: repo,
        getAllUsers: function() { return repo.getAllUsers(); },
        getUserById: function(id) { return repo.getUserById(id); },
        addUser: function(name, email) { return repo.addUser(name, email); },
        updateUser: function(id, data) { return repo.updateUser(id, data); },
        deleteUser: function(id) { return repo.deleteUser(id); }
    };
}

module.exports = { createUserApi: createUserApi };
`
        }
    ],
    boilerplateCode: `// This is a multi-file problem. Edit userRepository.js in the VSCode editor.
class UserRepository {
  // TODO: implement CRUD methods
}`,
    solutionTemplate: 'createUserApi',
    examples: [
        {
            input: 'getAllUsers()',
            output: '[]',
            explanation: 'No users in the table yet.'
        },
        {
            input: 'addUser("Alice", "alice@test.com")',
            output: '{ id: 1, name: "Alice", email: "alice@test.com" }'
        }
    ],
    constraints: [
        'Each method maps to a single Database method call',
        'The database.js and index.js files are complete -- only edit userRepository.js',
        'IDs are auto-incremented starting from 1'
    ],
    testCases: [
        {
            id: 1,
            input: JSON.stringify(["init-and-empty"]),
            expectedOutput: JSON.stringify([]),
            isHidden: false
        },
        {
            id: 2,
            input: JSON.stringify(["add-user"]),
            expectedOutput: JSON.stringify({ id: 1, name: "Alice", email: "alice@test.com" }),
            isHidden: false
        },
        {
            id: 3,
            input: JSON.stringify(["get-all-after-add"]),
            expectedOutput: JSON.stringify([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]),
            isHidden: false
        },
        {
            id: 4,
            input: JSON.stringify(["get-by-id"]),
            expectedOutput: JSON.stringify("Alice"),
            isHidden: false
        },
        {
            id: 5,
            input: JSON.stringify(["user-not-found"]),
            expectedOutput: JSON.stringify(null),
            isHidden: true
        },
        {
            id: 6,
            input: JSON.stringify(["delete-user"]),
            expectedOutput: JSON.stringify({ deleted: true, remaining: 1 }),
            isHidden: true
        }
    ]
};
