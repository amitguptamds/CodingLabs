/**
 * String utility functions.
 *
 * capitalize(str) -- returns the string with the first letter uppercased.
 * Example: capitalize("hello") -> "Hello"
 */
function capitalize(str) {
    // TODO: return the string with its first character uppercased
    return str.charAt(0) + str.slice(1);
}

module.exports = { capitalize };
