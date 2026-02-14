import { Problem } from '../../models/problem.model';

export const validParentheses: Problem = {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'Medium',
    tags: ['Stack', 'String'],
    boilerplateCode: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here

}`,
    solutionTemplate: 'isValid',
    examples: [
        { input: 's = "()"', output: 'true' },
        { input: 's = "()[]{}"', output: 'true' },
        { input: 's = "(]"', output: 'false' },
        { input: 's = "([])"', output: 'true' }
    ],
    constraints: [
        '1 <= s.length <= 10^4',
        "s consists of parentheses only '()[]{}'"
    ],
    testCases: [
        { id: 1, input: JSON.stringify(["()"]), expectedOutput: 'true', isHidden: false },
        { id: 2, input: JSON.stringify(["()[]{}"]), expectedOutput: 'true', isHidden: false },
        { id: 3, input: JSON.stringify(["(]"]), expectedOutput: 'false', isHidden: false },
        { id: 4, input: JSON.stringify(["([])"]), expectedOutput: 'true', isHidden: false },
        { id: 5, input: JSON.stringify(["({[)}]"]), expectedOutput: 'false', isHidden: true },
        { id: 6, input: JSON.stringify([""]), expectedOutput: 'true', isHidden: true }
    ]
};
