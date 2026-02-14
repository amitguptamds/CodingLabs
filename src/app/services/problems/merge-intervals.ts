import { Problem } from '../../models/problem.model';

export const mergeIntervals: Problem = {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    difficulty: 'Hard',
    tags: ['Array', 'Sorting'],
    boilerplateCode: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
  // Write your solution here

}`,
    solutionTemplate: 'merge',
    examples: [
        { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].' },
        { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]', explanation: 'Intervals [1,4] and [4,5] are considered overlapping.' }
    ],
    constraints: [
        '1 <= intervals.length <= 10^4',
        'intervals[i].length == 2',
        '0 <= start_i <= end_i <= 10^4'
    ],
    testCases: [
        { id: 1, input: JSON.stringify([[[1, 3], [2, 6], [8, 10], [15, 18]]]), expectedOutput: JSON.stringify([[1, 6], [8, 10], [15, 18]]), isHidden: false },
        { id: 2, input: JSON.stringify([[[1, 4], [4, 5]]]), expectedOutput: JSON.stringify([[1, 5]]), isHidden: false },
        { id: 3, input: JSON.stringify([[[1, 4], [0, 4]]]), expectedOutput: JSON.stringify([[0, 4]]), isHidden: false },
        { id: 4, input: JSON.stringify([[[1, 4], [2, 3]]]), expectedOutput: JSON.stringify([[1, 4]]), isHidden: true },
        { id: 5, input: JSON.stringify([[[1, 4], [0, 0]]]), expectedOutput: JSON.stringify([[0, 0], [1, 4]]), isHidden: true }
    ]
};
