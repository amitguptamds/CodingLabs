"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseStringPython = void 0;
exports.reverseStringPython = {
    id: 'reverse-string-python',
    title: 'Reverse String (Python)',
    description: `Write a function \`reverse_string\` that takes a string and returns it reversed.\n\nYou should not use Python's built-in \`[::-1]\` slicing.`,
    difficulty: 'Easy',
    tags: ['Python', 'String'],
    isMultiFile: false,
    language: 'python',
    boilerplateCode: 'def reverse_string(s):\n    # Write your solution here\n    pass',
    solutionTemplate: 'reverse_string',
    templateFiles: [],
    testCases: [
        { id: 1, input: JSON.stringify(['hello']), expectedOutput: JSON.stringify('olleh'), isHidden: false },
        { id: 2, input: JSON.stringify(['world']), expectedOutput: JSON.stringify('dlrow'), isHidden: false },
        { id: 3, input: JSON.stringify(['']), expectedOutput: JSON.stringify(''), isHidden: false },
        { id: 4, input: JSON.stringify(['racecar']), expectedOutput: JSON.stringify('racecar'), isHidden: true },
    ],
    examples: [
        { input: 's = "hello"', output: '"olleh"', explanation: 'The characters are reversed.' },
        { input: 's = "world"', output: '"dlrow"' },
    ],
    constraints: ['0 <= s.length <= 10^4', 's consists of printable ASCII characters.'],
};
//# sourceMappingURL=reverse-string-python.js.map