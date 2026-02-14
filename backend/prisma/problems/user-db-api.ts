export const userDbApi = {
    id: 'user-db-api',
    title: 'User Database API',
    description: 'Build a **user repository** on top of an in-memory database. Implement CRUD operations for a users table.',
    difficulty: 'Medium',
    tags: ['Database', 'CRUD', 'Multi-File'],
    isMultiFile: true,
    boilerplateCode: '// Multi-file problem -- implement the UserRepository methods.',
    solutionTemplate: 'createUserApi',
    templateFiles: [
        {
            name: 'database.js',
            path: 'src/database.js',
            language: 'javascript',
            content: '/**\n * In-Memory Database -- simulates SQLite-like storage.\n *\n * API:\n *   db.createTable(tableName)      -- create an empty table with auto-increment id\n *   db.insert(tableName, row)      -- insert a row, returns { id, ...row }\n *   db.findAll(tableName)          -- return all rows\n *   db.findById(tableName, id)     -- return one row or null\n *   db.update(tableName, id, data) -- update a row, returns updated row or null\n *   db.delete(tableName, id)       -- delete a row, returns true/false\n */\nclass Database {\n    constructor() {\n        this.tables = {};\n        this.sequences = {};\n    }\n\n    createTable(tableName) {\n        if (this.tables[tableName]) {\n            throw new Error(\"Table \'\" + tableName + \"\' already exists\");\n        }\n        this.tables[tableName] = [];\n        this.sequences[tableName] = 1;\n    }\n\n    insert(tableName, row) {\n        var table = this.tables[tableName];\n        if (!table) throw new Error(\"Table \'\" + tableName + \"\' does not exist\");\n        var id = this.sequences[tableName]++;\n        var newRow = Object.assign({ id: id }, row);\n        table.push(newRow);\n        return Object.assign({}, newRow);\n    }\n\n    findAll(tableName) {\n        var table = this.tables[tableName];\n        if (!table) throw new Error(\"Table \'\" + tableName + \"\' does not exist\");\n        return table.map(function(r) { return Object.assign({}, r); });\n    }\n\n    findById(tableName, id) {\n        var table = this.tables[tableName];\n        if (!table) throw new Error(\"Table \'\" + tableName + \"\' does not exist\");\n        var row = null;\n        for (var i = 0; i < table.length; i++) {\n            if (table[i].id === id) { row = table[i]; break; }\n        }\n        return row ? Object.assign({}, row) : null;\n    }\n\n    update(tableName, id, data) {\n        var table = this.tables[tableName];\n        if (!table) throw new Error(\"Table \'\" + tableName + \"\' does not exist\");\n        for (var i = 0; i < table.length; i++) {\n            if (table[i].id === id) {\n                Object.assign(table[i], data);\n                return Object.assign({}, table[i]);\n            }\n        }\n        return null;\n    }\n\n    delete(tableName, id) {\n        var table = this.tables[tableName];\n        if (!table) throw new Error(\"Table \'\" + tableName + \"\' does not exist\");\n        for (var i = 0; i < table.length; i++) {\n            if (table[i].id === id) {\n                table.splice(i, 1);\n                return true;\n            }\n        }\n        return false;\n    }\n}\n\nmodule.exports = Database;\n',
        },
        {
            name: 'userRepository.js',
            path: 'src/userRepository.js',
            language: 'javascript',
            content: '/**\n * UserRepository -- CRUD operations for the \'users\' table.\n *\n * You have access to this.db (a Database instance) with these methods:\n *   this.db.createTable(tableName)\n *   this.db.insert(tableName, { key: value, ... })\n *   this.db.findAll(tableName)\n *   this.db.findById(tableName, id)\n *   this.db.update(tableName, id, { key: value, ... })\n *   this.db.delete(tableName, id)\n *\n * Implement the methods below.\n */\nclass UserRepository {\n    constructor(db) {\n        this.db = db;\n    }\n\n    // Create the \'users\' table\n    initTable() {\n        // TODO: call this.db.createTable with the table name \'users\'\n    }\n\n    // Return an array of all users\n    getAllUsers() {\n        // TODO: return all rows from the \'users\' table\n    }\n\n    // Return a single user by ID, or null if not found\n    getUserById(id) {\n        // TODO: return the user with the given id\n    }\n\n    // Insert a new user with { name, email } and return the created row\n    addUser(name, email) {\n        // TODO: insert a row into \'users\' and return the result\n    }\n\n    // Update a user\'s data by ID, return the updated row or null\n    updateUser(id, data) {\n        // TODO: update the user with the given id\n    }\n\n    // Delete a user by ID, return true if deleted, false if not found\n    deleteUser(id) {\n        // TODO: delete the user with the given id\n    }\n}\n\nmodule.exports = UserRepository;\n',
        },
        {
            name: 'index.js',
            path: 'src/index.js',
            language: 'javascript',
            content: 'var Database = require(\'./database\');\nvar UserRepository = require(\'./userRepository\');\n\n/**\n * Wire the Database and UserRepository together.\n * createUserApi() returns an object with repository methods.\n */\nfunction createUserApi() {\n    var db = new Database();\n    var repo = new UserRepository(db);\n    repo.initTable();\n\n    return {\n        db: db,\n        repo: repo,\n        getAllUsers: function() { return repo.getAllUsers(); },\n        getUserById: function(id) { return repo.getUserById(id); },\n        addUser: function(name, email) { return repo.addUser(name, email); },\n        updateUser: function(id, data) { return repo.updateUser(id, data); },\n        deleteUser: function(id) { return repo.deleteUser(id); }\n    };\n}\n\nmodule.exports = { createUserApi: createUserApi };\n',
        },
    ],
    testCases: [
        { id: 1, input: JSON.stringify(['init-and-empty']), expectedOutput: JSON.stringify([]), isHidden: false },
        { id: 2, input: JSON.stringify(['add-user']), expectedOutput: JSON.stringify({ id: 1, name: 'Alice', email: 'alice@test.com' }), isHidden: false },
        { id: 3, input: JSON.stringify(['get-all-after-add']), expectedOutput: JSON.stringify([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]), isHidden: false },
        { id: 4, input: JSON.stringify(['get-by-id']), expectedOutput: JSON.stringify('Alice'), isHidden: false },
        { id: 5, input: JSON.stringify(['user-not-found']), expectedOutput: JSON.stringify(null), isHidden: true },
        { id: 6, input: JSON.stringify(['delete-user']), expectedOutput: JSON.stringify({ deleted: true, remaining: 1 }), isHidden: true },
    ],
    examples: [
        { input: 'getAllUsers()', output: '[]', explanation: 'No users in the table yet.' },
        { input: 'addUser("Alice", "alice@test.com")', output: '{ id: 1, name: "Alice", email: "alice@test.com" }' },
    ],
    constraints: [
        'Each method maps to a single Database method call',
        'The database.js and index.js files are complete -- only edit userRepository.js',
        'IDs are auto-incremented starting from 1',
    ],
};
