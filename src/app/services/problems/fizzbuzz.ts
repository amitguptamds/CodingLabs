import { Problem } from '../../models/problem.model';

export const fizzbuzz: Problem = {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    description: `Given an integer \`n\`, return a string array \`answer\` (1-indexed) where:

- \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by 3 and 5.
- \`answer[i] == "Fizz"\` if \`i\` is divisible by 3.
- \`answer[i] == "Buzz"\` if \`i\` is divisible by 5.
- \`answer[i] == i\` (as a string) if none of the above conditions are true.`,
    difficulty: 'Medium',
    tags: ['Math', 'String', 'Simulation'],
    boilerplateCode: `/**
 * @param {number} n
 * @return {string[]}
 */
function fizzBuzz(n) {
  // Write your solution here

}`,
    solutionTemplate: 'fizzBuzz',
    examples: [
        { input: 'n = 3', output: '["1","2","Fizz"]' },
        { input: 'n = 5', output: '["1","2","Fizz","4","Buzz"]' },
        { input: 'n = 15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' }
    ],
    constraints: [
        '1 <= n <= 10^4'
    ],
    testCases: [
        { id: 1, input: JSON.stringify([3]), expectedOutput: JSON.stringify(["1", "2", "Fizz"]), isHidden: false },
        { id: 2, input: JSON.stringify([5]), expectedOutput: JSON.stringify(["1", "2", "Fizz", "4", "Buzz"]), isHidden: false },
        { id: 3, input: JSON.stringify([15]), expectedOutput: JSON.stringify(["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"]), isHidden: false },
        { id: 4, input: JSON.stringify([1]), expectedOutput: JSON.stringify(["1"]), isHidden: true }
    ]
};
