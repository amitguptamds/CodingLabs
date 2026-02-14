import { Problem } from '../../models/problem.model';

export const reverseStringRust: Problem = {
    id: 'reverse-string-rust',
    title: 'Reverse String (Rust)',
    description: `Write a function \`reverse_string\` that takes a \`String\` and returns it reversed.`,
    difficulty: 'Easy',
    tags: ['Rust', 'String'],
    language: 'rust',
    boilerplateCode: `fn reverse_string(s: String) -> String {
    // Write your solution here
    String::new()
}`,
    solutionTemplate: 'reverse_string',
    examples: [
        { input: 's = "hello"', output: '"olleh"', explanation: 'The characters are reversed.' },
        { input: 's = "world"', output: '"dlrow"' },
    ],
    constraints: ['0 <= s.len() <= 10^4', 's consists of printable ASCII characters.'],
    testCases: [
        { id: 1, input: JSON.stringify(['hello']), expectedOutput: 'olleh', isHidden: false },
        { id: 2, input: JSON.stringify(['world']), expectedOutput: 'dlrow', isHidden: false },
        { id: 3, input: JSON.stringify(['']), expectedOutput: '', isHidden: false },
        { id: 4, input: JSON.stringify(['racecar']), expectedOutput: 'racecar', isHidden: true },
    ]
};
