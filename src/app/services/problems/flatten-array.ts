import { Problem } from '../../models/problem.model';

export const flattenArray: Problem = {
    id: 'flatten-array',
    title: 'Flatten Nested Array',
    description: `Given a multi-dimensional array \`arr\` and a depth \`n\`, return a flattened version of that array.

A **multi-dimensional** array is a recursive data structure that contains integers or other multi-dimensional arrays.

A **flattened** array is a version of that array with some or all of the sub-arrays removed and replaced with the actual elements in that sub-array. This flattening operation should only be done if the current depth of nesting is less than \`n\`.

The depth of the elements in the first array are considered to be \`0\`.`,
    difficulty: 'Hard',
    tags: ['Array', 'Recursion'],
    boilerplateCode: `/**
 * @param {Array} arr
 * @param {number} depth
 * @return {Array}
 */
function flattenArray(arr, depth) {
  // Write your solution here

}`,
    solutionTemplate: 'flattenArray',
    examples: [
        { input: 'arr = [1, 2, 3, [4, 5, 6], [7, 8, [9, 10, 11], 12], [13, 14, 15]], n = 0', output: '[1, 2, 3, [4, 5, 6], [7, 8, [9, 10, 11], 12], [13, 14, 15]]', explanation: 'No subarray should be flattened as depth is 0.' },
        { input: 'arr = [1, 2, 3, [4, 5, 6], [7, 8, [9, 10, 11], 12], [13, 14, 15]], n = 1', output: '[1, 2, 3, 4, 5, 6, 7, 8, [9, 10, 11], 12, 13, 14, 15]', explanation: 'Subarrays at depth 0 are flattened by 1 level.' }
    ],
    constraints: [
        '0 <= count of numbers in arr <= 10^5',
        '0 <= count of subarrays in arr <= 10^5',
        'maxDepth <= 1000',
        '-1000 <= each number <= 1000',
        '0 <= n <= 1000'
    ],
    testCases: [
        { id: 1, input: JSON.stringify([[[1, 2, 3, [4, 5, 6], [7, 8, [9, 10, 11], 12], [13, 14, 15]], 0]]), expectedOutput: JSON.stringify([1, 2, 3, [4, 5, 6], [7, 8, [9, 10, 11], 12], [13, 14, 15]]), isHidden: false },
        { id: 2, input: JSON.stringify([[[1, 2, 3, [4, 5, 6], [7, 8, [9, 10, 11], 12], [13, 14, 15]], 1]]), expectedOutput: JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, [9, 10, 11], 12, 13, 14, 15]), isHidden: false },
        { id: 3, input: JSON.stringify([[[1, [2, [3, [4]]]], 2]]), expectedOutput: JSON.stringify([1, 2, 3, [4]]), isHidden: false },
        { id: 4, input: JSON.stringify([[[1, [2, [3, [4]]]], 100]]), expectedOutput: JSON.stringify([1, 2, 3, 4]), isHidden: true }
    ]
};
