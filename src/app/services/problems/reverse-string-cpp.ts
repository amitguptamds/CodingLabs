import { Problem } from '../../models/problem.model';

export const reverseStringCpp: Problem = {
    id: 'reverse-string-cpp',
    title: 'Reverse String (C++)',
    description: `Write a function \`reverseString\` that takes a \`string\` and returns it reversed.

Do not use \`std::reverse\`.`,
    difficulty: 'Easy',
    tags: ['C++', 'String'],
    language: 'cpp',
    boilerplateCode: `string reverseString(string s) {
    // Write your solution here
    return "";
}`,
    solutionTemplate: 'reverseString',
    examples: [
        { input: 's = "hello"', output: '"olleh"', explanation: 'The characters are reversed.' },
        { input: 's = "world"', output: '"dlrow"' },
    ],
    constraints: ['0 <= s.length() <= 10^4', 's consists of printable ASCII characters.'],
    testCases: [
        { id: 1, input: JSON.stringify(['hello']), expectedOutput: 'olleh', isHidden: false },
        { id: 2, input: JSON.stringify(['world']), expectedOutput: 'dlrow', isHidden: false },
        { id: 3, input: JSON.stringify(['']), expectedOutput: '', isHidden: false },
        { id: 4, input: JSON.stringify(['racecar']), expectedOutput: 'racecar', isHidden: true },
    ]
};
