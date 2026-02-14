import { Problem } from '../../models/problem.model';

export const reverseString: Problem = {
    id: 'reverse-string',
    title: 'Reverse String',
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array **in-place** with O(1) extra memory.`,
    difficulty: 'Easy',
    tags: ['String', 'Two Pointers'],
    boilerplateCode: `/**
 * @param {string[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
function reverseString(s) {
  // Write your solution here

}`,
    solutionTemplate: 'reverseString',
    examples: [
        { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
        { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' }
    ],
    constraints: [
        '1 <= s.length <= 10^5',
        's[i] is a printable ASCII character.'
    ],
    testCases: [
        { id: 1, input: JSON.stringify([["h", "e", "l", "l", "o"]]), expectedOutput: JSON.stringify(["o", "l", "l", "e", "h"]), isHidden: false },
        { id: 2, input: JSON.stringify([["H", "a", "n", "n", "a", "h"]]), expectedOutput: JSON.stringify(["h", "a", "n", "n", "a", "H"]), isHidden: false },
        { id: 3, input: JSON.stringify([["A"]]), expectedOutput: JSON.stringify(["A"]), isHidden: false },
        { id: 4, input: JSON.stringify([["a", "b", "c", "d"]]), expectedOutput: JSON.stringify(["d", "c", "b", "a"]), isHidden: true }
    ]
};
