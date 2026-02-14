import { Problem } from '../../models/problem.model';

export const greetingSystem: Problem = {
    id: 'greeting-system',
    title: 'Greeting System',
    description: `Build a simple **Greeting System** across multiple files.

A \`capitalize()\` utility function is needed to capitalize names. The \`Greeter\` class and \`index.js\` wiring are already implemented for you — you just need to complete the one missing function in \`utils.js\`.

Your task:
- **\`capitalize(str)\`** — Return the string with its first character uppercased

Everything else is already done!`,
    difficulty: 'Easy',
    tags: ['String', 'Multi-File'],
    isMultiFile: true,
    files: [
        {
            name: 'utils.js',
            path: 'src/utils.js',
            language: 'javascript',
            content: `/**
 * String utility functions.
 *
 * capitalize(str) — returns the string with the first letter uppercased.
 * Example: capitalize("hello") → "Hello"
 */
function capitalize(str) {
  // TODO: return the string with its first character uppercased
}

module.exports = { capitalize };
`
        },
        {
            name: 'greeter.js',
            path: 'src/greeter.js',
            language: 'javascript',
            content: `/**
 * Greeter class — uses capitalize() from utils to build greetings.
 *
 * Usage:
 *   const greeter = new Greeter(capitalize);
 *   greeter.greet("world");  // → "Hello, World!"
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
`
        },
        {
            name: 'index.js',
            path: 'src/index.js',
            language: 'javascript',
            content: `const { capitalize } = require('./utils');
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
`
        }
    ],
    boilerplateCode: `// This is a multi-file problem. Edit utils.js in the VSCode editor.
function capitalize(str) {
  // TODO: return the string with its first character uppercased
}`,
    solutionTemplate: 'createGreeter',
    examples: [
        {
            input: 'greet("world")',
            output: '"Hello, World!"',
            explanation: 'capitalize("world") returns "World", then the greeter wraps it.'
        },
        {
            input: 'greetMultiple(["alice", "bob"])',
            output: '["Hello, Alice!", "Hello, Bob!"]'
        }
    ],
    constraints: [
        'capitalize() must uppercase only the first character',
        'capitalize("") should return ""',
        'The Greeter class and index.js are already complete — only edit utils.js'
    ],
    testCases: [
        {
            id: 1,
            input: JSON.stringify(["basic-greet"]),
            expectedOutput: JSON.stringify("Hello, World!"),
            isHidden: false
        },
        {
            id: 2,
            input: JSON.stringify(["multi-greet"]),
            expectedOutput: JSON.stringify(["Hello, Alice!", "Hello, Bob!"]),
            isHidden: false
        },
        {
            id: 3,
            input: JSON.stringify(["empty-string"]),
            expectedOutput: JSON.stringify("Hello, !"),
            isHidden: false
        },
        {
            id: 4,
            input: JSON.stringify(["get-greeter"]),
            expectedOutput: JSON.stringify(true),
            isHidden: true
        },
        {
            id: 5,
            input: JSON.stringify(["already-capitalized"]),
            expectedOutput: JSON.stringify("Hello, Alice!"),
            isHidden: true
        }
    ]
};
