export const reverseStringJava = {
    id: 'reverse-string-java',
    title: 'Reverse String (Java)',
    description: `Write a static method \`reverseString\` inside a \`Solution\` class that takes a String and returns it reversed.\n\nDo not use \`StringBuilder.reverse()\`.`,
    difficulty: 'Easy',
    tags: ['Java', 'String'],
    isMultiFile: false,
    language: 'java',
    boilerplateCode: 'class Solution {\n    public static String reverseString(String s) {\n        // Write your solution here\n        return "";\n    }\n}',
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
    constraints: ['0 <= s.length() <= 10^4', 's consists of printable ASCII characters.'],
};
