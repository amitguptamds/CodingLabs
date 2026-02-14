export const twoSum = {
    id: 'two-sum',
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    isMultiFile: false,
    boilerplateCode: 'function twoSum(nums, target) {\n  // Write your solution here\n}',
    solutionTemplate: 'twoSum',
    templateFiles: [],
    testCases: [
        { id: 1, input: JSON.stringify([[2, 7, 11, 15], 9]), expectedOutput: JSON.stringify([0, 1]), isHidden: false },
        { id: 2, input: JSON.stringify([[3, 2, 4], 6]), expectedOutput: JSON.stringify([1, 2]), isHidden: false },
        { id: 3, input: JSON.stringify([[3, 3], 6]), expectedOutput: JSON.stringify([0, 1]), isHidden: false },
        { id: 4, input: JSON.stringify([[1, 5, 3, 7], 8]), expectedOutput: JSON.stringify([1, 2]), isHidden: true },
        { id: 5, input: JSON.stringify([[-1, -2, -3, -4, -5], -8]), expectedOutput: JSON.stringify([2, 4]), isHidden: true },
    ],
    examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
};
