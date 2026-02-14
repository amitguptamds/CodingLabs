import { Problem } from '../../models/problem.model';

export const twoSum: Problem = {
    id: 'two-sum',
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    boilerplateCode: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here

}`,
    solutionTemplate: 'twoSum',
    examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
        { input: 'nums = [3,3], target = 6', output: '[0,1]' }
    ],
    constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
    ],
    testCases: [
        { id: 1, input: JSON.stringify([[2, 7, 11, 15], 9]), expectedOutput: JSON.stringify([0, 1]), isHidden: false },
        { id: 2, input: JSON.stringify([[3, 2, 4], 6]), expectedOutput: JSON.stringify([1, 2]), isHidden: false },
        { id: 3, input: JSON.stringify([[3, 3], 6]), expectedOutput: JSON.stringify([0, 1]), isHidden: false },
        { id: 4, input: JSON.stringify([[1, 5, 3, 7], 8]), expectedOutput: JSON.stringify([1, 2]), isHidden: true },
        { id: 5, input: JSON.stringify([[-1, -2, -3, -4, -5], -8]), expectedOutput: JSON.stringify([2, 4]), isHidden: true }
    ]
};
