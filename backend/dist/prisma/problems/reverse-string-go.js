"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseStringGo = void 0;
exports.reverseStringGo = {
    id: 'reverse-string-go',
    title: 'Reverse String (Go)',
    description: 'Write a function `ReverseString` that takes a string and returns it reversed.',
    difficulty: 'Easy',
    tags: ['Go', 'String'],
    isMultiFile: false,
    language: 'go',
    boilerplateCode: 'func ReverseString(s string) string {\n\t// Write your solution here\n\treturn ""\n}',
    solutionTemplate: 'ReverseString',
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
    constraints: ['0 <= len(s) <= 10^4', 's consists of printable ASCII characters.'],
};
//# sourceMappingURL=reverse-string-go.js.map