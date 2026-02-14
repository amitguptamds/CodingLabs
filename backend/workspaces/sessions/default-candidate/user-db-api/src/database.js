/**
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
