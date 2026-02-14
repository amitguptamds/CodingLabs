/**
 * Backend Problem Definitions
 * Each problem is defined in its own file and re-exported here.
 */
import { twoSum } from './two-sum';
import { reverseString } from './reverse-string';
import { eventEmitter } from './event-emitter';
import { greetingSystem } from './greeting-system';
import { todoDataLayer } from './todo-data-layer';
import { userDbApi } from './user-db-api';

export const problems = [
    twoSum,
    reverseString,
    eventEmitter,
    greetingSystem,
    todoDataLayer,
    userDbApi,
];
