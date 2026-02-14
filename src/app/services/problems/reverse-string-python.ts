import { Problem } from '../../models/problem.model';

export const reverseStringPython: Problem = {
    id: 'reverse-string-python',
    title: 'Reverse String (Python)',
    description: `Write a function \`reverse_string\` that takes a string and returns it reversed.

You should not use Python's built-in \`[::-1]\` slicing.`,
    difficulty: 'Easy',
    tags: ['Python', 'String'],
    language: 'python',
    boilerplateCode: `def reverse_string(s):
    # Write your solution here
    pass`,
    solutionTemplate: 'reverse_string',
    examples: [
        { input: 's = "hello"', output: '"olleh"', explanation: 'The characters are reversed.' },
        { input: 's = "world"', output: '"dlrow"' },
    ],
    constraints: ['0 <= len(s) <= 10^4', 's consists of printable ASCII characters.'],
    testCases: [
        { id: 1, input: JSON.stringify(['hello']), expectedOutput: JSON.stringify('olleh'), isHidden: false },
        { id: 2, input: JSON.stringify(['world']), expectedOutput: JSON.stringify('dlrow'), isHidden: false },
        { id: 3, input: JSON.stringify(['']), expectedOutput: JSON.stringify(''), isHidden: false },
        { id: 4, input: JSON.stringify(['racecar']), expectedOutput: JSON.stringify('racecar'), isHidden: true },
    ]
};
