import { Problem } from '../../models/problem.model';

export const reverseStringGo: Problem = {
    id: 'reverse-string-go',
    title: 'Reverse String (Go)',
    description: `Write a function \`ReverseString\` that takes a string and returns it reversed.`,
    difficulty: 'Easy',
    tags: ['Go', 'String'],
    language: 'go',
    boilerplateCode: `func ReverseString(s string) string {
\t// Write your solution here
\treturn ""
}`,
    solutionTemplate: 'ReverseString',
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
