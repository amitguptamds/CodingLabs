export const greetingSystem = {
    id: 'greeting-system',
    title: 'Greeting System',
    description: 'Build a simple **Greeting System** across multiple files.\\n\\nA `capitalize()` utility function is needed to capitalize names. The `Greeter` class and `index.js` wiring are already implemented for you — you just need to complete the one missing function.',
    difficulty: 'Easy',
    tags: ['String', 'Multi-File'],
    isMultiFile: true,
    boilerplateCode: '// Multi-file problem — edit the utils.js file in the editor.',
    solutionTemplate: 'createGreeter',
    templateFiles: [
        {
            name: 'utils.js',
            path: 'src/utils.js',
            language: 'javascript',
            content: '/**\\n * String utility functions.\\n *\\n * capitalize(str) — returns the string with the first letter uppercased.\\n * Example: capitalize(\\"hello\\") → \\"Hello\\"\\n */\\nfunction capitalize(str) {\\n  // TODO: return the string with its first character uppercased\\n}\\n\\nmodule.exports = { capitalize };\\n',
        },
        {
            name: 'greeter.js',
            path: 'src/greeter.js',
            language: 'javascript',
            content: '/**\\n * Greeter class — uses capitalize() from utils to build greetings.\\n *\\n * Usage:\\n *   const greeter = new Greeter(capitalize);\\n *   greeter.greet(\\"world\\");  // → \\"Hello, World!\\"\\n */\\nclass Greeter {\\n  constructor(capitalizeFn) {\\n    this.capitalize = capitalizeFn;\\n  }\\n\\n  greet(name) {\\n    const capitalized = this.capitalize(name);\\n    return \\"Hello, \\" + capitalized + \\"!\\";\\n  }\\n\\n  greetMultiple(names) {\\n    return names.map(n => this.greet(n));\\n  }\\n}\\n\\nmodule.exports = Greeter;\\n',
        },
        {
            name: 'index.js',
            path: 'src/index.js',
            language: 'javascript',
            content: '/**\\n * Wire the Greeter and utility functions together.\\n * createGreeter() returns { greet, greetMultiple, greeter }\\n */\\nfunction createGreeter() {\\n  const greeter = new Greeter(capitalize);\\n  return {\\n    greeter,\\n    greet(name) { return greeter.greet(name); },\\n    greetMultiple(names) { return greeter.greetMultiple(names); }\\n  };\\n}\\n',
        },
    ],
    testCases: [
        { id: 1, input: JSON.stringify(['basic-greet']), expectedOutput: JSON.stringify('Hello, World!'), isHidden: false },
        { id: 2, input: JSON.stringify(['multi-greet']), expectedOutput: JSON.stringify(['Hello, Alice!', 'Hello, Bob!']), isHidden: false },
        { id: 3, input: JSON.stringify(['empty-string']), expectedOutput: JSON.stringify('Hello, !'), isHidden: false },
        { id: 4, input: JSON.stringify(['get-greeter']), expectedOutput: JSON.stringify(true), isHidden: true },
        { id: 5, input: JSON.stringify(['already-capitalized']), expectedOutput: JSON.stringify('Hello, Alice!'), isHidden: true },
    ],
    examples: [
        { input: 'greet("world")', output: '"Hello, World!"', explanation: 'capitalize("world") returns "World", then the greeter wraps it.' },
        { input: 'greetMultiple(["alice", "bob"])', output: '["Hello, Alice!", "Hello, Bob!"]' },
    ],
    constraints: [
        'capitalize() must uppercase only the first character',
        'capitalize("") should return ""',
        'The Greeter class and index.js are already complete — only edit utils.js',
    ],
};
