"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseStringTypescript = void 0;
exports.reverseStringTypescript = {
    id: 'reverse-string-typescript',
    title: 'Reverse String (TypeScript)',
    description: `Write a function \`reverseString\` that takes a string and returns it reversed.\n\nDo not use \`Array.reverse()\` or \`split().reverse().join()\`.`,
    difficulty: 'Easy',
    tags: ['TypeScript', 'String'],
    isMultiFile: false,
    language: 'typescript',
    boilerplateCode: 'function reverseString(s: string): string {\n    // Write your solution here\n    return "";\n}',
    solutionTemplate: 'reverseString',
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
//# sourceMappingURL=reverse-string-typescript.js.map