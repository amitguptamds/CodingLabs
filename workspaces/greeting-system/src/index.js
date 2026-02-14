const { capitalize } = require('./utils');
const Greeter = require('./greeter');

/**
 * Wire the Greeter and utility functions together.
 * createGreeter() returns { greet, greetMultiple, greeter }
 */
function createGreeter() {
    const greeter = new Greeter(capitalize);

    return {
        greeter,
        greet(name) {
            return greeter.greet(name);
        },
        greetMultiple(names) {
            return greeter.greetMultiple(names);
        }
    };
}

module.exports = { createGreeter };
