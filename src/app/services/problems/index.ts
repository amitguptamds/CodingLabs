/**
 * Frontend Problem Definitions
 * Each problem is defined in its own file and re-exported here.
 */
import { Problem } from '../../models/problem.model';

import { twoSum } from './two-sum';
import { reverseString } from './reverse-string';
import { validParentheses } from './valid-parentheses';
import { fizzbuzz } from './fizzbuzz';
import { mergeIntervals } from './merge-intervals';
import { flattenArray } from './flatten-array';
import { eventEmitter } from './event-emitter';
import { greetingSystem } from './greeting-system';
import { todoDataLayer } from './todo-data-layer';
import { userDbApi } from './user-db-api';

export const problems: Problem[] = [
    twoSum,
    reverseString,
    validParentheses,
    fizzbuzz,
    mergeIntervals,
    flattenArray,
    eventEmitter,
    greetingSystem,
    todoDataLayer,
    userDbApi,
];
