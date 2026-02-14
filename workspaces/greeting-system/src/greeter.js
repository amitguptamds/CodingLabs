/**
 * Greeter class -- uses capitalize() from utils to build greetings.
 *
 * Usage:
 *   const greeter = new Greeter(capitalize);
 *   greeter.greet("world");  // -> "Hello, World!"
 *   greeter.greet("alice");  // -> "Hello, Alice!"
 */
class Greeter {
    constructor(capitalizeFn) {
        this.capitalize = capitalizeFn;
    }

    greet(name) {
        const capitalized = this.capitalize(name);
        return "Hello, " + capitalized + "!";
    }

    greetMultiple(names) {
        return names.map(n => this.greet(n));
    }
}

module.exports = Greeter;
