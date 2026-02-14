var Database = require('./database');
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
        getAllUsers: function () { return repo.getAllUsers(); },
        getUserById: function (id) { return repo.getUserById(id); },
        addUser: function (name, email) { return repo.addUser(name, email); },
        updateUser: function (id, data) { return repo.updateUser(id, data); },
        deleteUser: function (id) { return repo.deleteUser(id); }
    };
}

module.exports = { createUserApi: createUserApi };
