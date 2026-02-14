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
import { pythonTaskManager } from './python-task-manager';
import { javaTaskManager } from './java-task-manager';
import { cppTaskManager } from './cpp-task-manager';
import { typescriptTaskManager } from './typescript-task-manager';
import { goTaskManager } from './go-task-manager';
import { rustTaskManager } from './rust-task-manager';
import { reverseStringPython } from './reverse-string-python';
import { reverseStringJava } from './reverse-string-java';
import { reverseStringCpp } from './reverse-string-cpp';
import { reverseStringTypescript } from './reverse-string-typescript';
import { reverseStringGo } from './reverse-string-go';
import { reverseStringRust } from './reverse-string-rust';
import { selectEmployeesHighSalary } from './select-employees-high-salary';
import { optimizeOrderQuery } from './optimize-order-query';
import { findActiveUsers } from './find-active-users';
import { aggregateOrderTotals } from './aggregate-order-totals';

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
    pythonTaskManager,
    javaTaskManager,
    cppTaskManager,
    typescriptTaskManager,
    goTaskManager,
    rustTaskManager,
    reverseStringPython,
    reverseStringJava,
    reverseStringCpp,
    reverseStringTypescript,
    reverseStringGo,
    reverseStringRust,
    selectEmployeesHighSalary,
    optimizeOrderQuery,
    findActiveUsers,
    aggregateOrderTotals,
];
