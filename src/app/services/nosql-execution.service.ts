import { Injectable } from '@angular/core';
import { TestCase, TestResult } from '../models/problem.model';

declare const mingo: any;

@Injectable({ providedIn: 'root' })
export class NosqlExecutionService {
    private mingoLoaded = false;

    /**
     * Load mingo from CDN (once).
     */
    async ensureLoaded(): Promise<void> {
        if (this.mingoLoaded) return;

        await new Promise<void>((resolve, reject) => {
            if (typeof mingo !== 'undefined') {
                this.mingoLoaded = true;
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/mingo/dist/mingo.min.js';
            script.onload = () => {
                this.mingoLoaded = true;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load mingo'));
            document.head.appendChild(script);
        });
    }

    /**
     * Execute the candidate's NoSQL query against each test case.
     * The candidate's code should return an object with either:
     *   { operation: 'find', query: {...}, projection: {...}, sort: {...}, limit: N }
     *   { operation: 'aggregate', pipeline: [...] }
     */
    async executeNoSQL(
        userCode: string,
        seedData: string,
        testCases: TestCase[]
    ): Promise<TestResult[]> {
        await this.ensureLoaded();

        const results: TestResult[] = [];

        for (const tc of testCases) {
            const start = performance.now();

            try {
                // Parse seed documents
                const collection = JSON.parse(seedData);

                // Execute the user's code to get query specification
                const querySpec = this.evaluateUserCode(userCode, collection);
                const elapsed = performance.now() - start;

                // Convert result to JSON string for comparison
                const actualOutput = JSON.stringify(querySpec.result);
                const passed = this.compareOutputs(actualOutput, tc.expectedOutput.trim());

                results.push({
                    testCase: tc,
                    passed,
                    actualOutput,
                    executionTime: elapsed,
                });
            } catch (err: any) {
                const elapsed = performance.now() - start;
                results.push({
                    testCase: tc,
                    passed: false,
                    actualOutput: '',
                    error: err.message || String(err),
                    executionTime: elapsed,
                });
            }
        }

        return results;
    }

    /**
     * Execute user code and return the query result.
     * User code is a function body that has access to:
     *   - `collection`: the seed data array
     *   - `db`: helper object with find() and aggregate()
     */
    private evaluateUserCode(userCode: string, collection: any[]): { result: any[] } {
        // Create db helper that wraps mingo operations
        const db: any = {
            find: (query: any = {}, projection: any = {}) => {
                const cursor = mingo.find(collection, query, projection);
                const chainable: any = {
                    sort: (s: any) => { cursor.sort(s); return chainable; },
                    limit: (n: number) => { cursor.limit(n); return chainable; },
                    skip: (n: number) => { cursor.skip(n); return chainable; },
                    toArray: () => cursor.all(),
                    all: () => cursor.all(),
                };
                return chainable;
            },
            aggregate: (pipeline: any[]) => {
                const agg = new mingo.Aggregator(pipeline);
                return agg.run(collection);
            },
        };

        // Execute user code
        const fn = new Function('db', 'collection', userCode);
        const result = fn(db, collection);

        // If result is an array, use directly
        if (Array.isArray(result)) {
            return { result };
        }

        // If result has toArray/all method (chainable cursor)
        if (result && typeof result.toArray === 'function') {
            return { result: result.toArray() };
        }
        if (result && typeof result.all === 'function') {
            return { result: result.all() };
        }

        throw new Error('Your code must return an array of documents or a cursor (.toArray())');
    }

    /**
     * Compare actual and expected outputs (JSON normalization).
     * Normalizes key ordering to handle differences between mingo output
     * and expected output (e.g., {age, city, name} vs {name, age, city}).
     */
    private compareOutputs(actual: string, expected: string): boolean {
        try {
            const a = JSON.parse(actual);
            const e = JSON.parse(expected);
            return JSON.stringify(this.sortKeys(a)) === JSON.stringify(this.sortKeys(e));
        } catch {
            return actual.trim() === expected.trim();
        }
    }

    /**
     * Recursively sort object keys for order-agnostic comparison.
     */
    private sortKeys(value: any): any {
        if (Array.isArray(value)) {
            return value.map(item => this.sortKeys(item));
        }
        if (value !== null && typeof value === 'object') {
            const sorted: any = {};
            for (const key of Object.keys(value).sort()) {
                sorted[key] = this.sortKeys(value[key]);
            }
            return sorted;
        }
        return value;
    }

    /**
     * Run user code and return documents for display purposes.
     */
    async runForDisplay(userCode: string, seedData: string): Promise<any[]> {
        await this.ensureLoaded();
        try {
            const collection = JSON.parse(seedData);
            const result = this.evaluateUserCode(userCode, collection);
            return result.result;
        } catch {
            return [];
        }
    }
}
