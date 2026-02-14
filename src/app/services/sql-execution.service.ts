import { Injectable } from '@angular/core';
import { TestCase, TestResult } from '../models/problem.model';

declare const initSqlJs: any;

@Injectable({ providedIn: 'root' })
export class SqlExecutionService {
    private sqlJsLoaded = false;
    private SQL: any = null;

    /**
     * Load sql.js from CDN (once).
     */
    async ensureLoaded(): Promise<void> {
        if (this.sqlJsLoaded) return;

        await new Promise<void>((resolve, reject) => {
            if (typeof initSqlJs !== 'undefined') {
                this.initSql().then(resolve).catch(reject);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://sql.js.org/dist/sql-wasm.js';
            script.onload = () => this.initSql().then(resolve).catch(reject);
            script.onerror = () => reject(new Error('Failed to load sql.js'));
            document.head.appendChild(script);
        });
    }

    private async initSql(): Promise<void> {
        this.SQL = await initSqlJs({
            locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
        });
        this.sqlJsLoaded = true;
    }

    /**
     * Execute the candidate's SQL query against each test case.
     * Each test case gets a fresh database built from `setupSQL`.
     */
    async executeSQL(
        userQuery: string,
        setupSQL: string,
        testCases: TestCase[]
    ): Promise<TestResult[]> {
        await this.ensureLoaded();

        const results: TestResult[] = [];

        for (const tc of testCases) {
            const start = performance.now();
            let db: any = null;

            try {
                db = new this.SQL.Database();

                // Run setup SQL (schema + seed data)
                db.run(setupSQL);

                // Execute candidate query
                const queryResult = db.exec(userQuery);

                const elapsed = performance.now() - start;

                // Convert result to JSON string for comparison
                const actualOutput = this.resultToJson(queryResult);
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
            } finally {
                if (db) db.close();
            }
        }

        return results;
    }

    /**
     * Convert sql.js exec() output to a JSON string.
     * exec() returns: [{ columns: string[], values: any[][] }]
     */
    private resultToJson(execResult: any[]): string {
        if (!execResult || execResult.length === 0) {
            return '[]';
        }

        const { columns, values } = execResult[0];
        const rows = values.map((row: any[]) => {
            const obj: Record<string, any> = {};
            columns.forEach((col: string, i: number) => {
                obj[col] = row[i];
            });
            return obj;
        });

        return JSON.stringify(rows);
    }

    /**
     * Compare actual and expected outputs.
     * Handles JSON normalization.
     */
    private compareOutputs(actual: string, expected: string): boolean {
        try {
            const a = JSON.parse(actual);
            const e = JSON.parse(expected);
            return JSON.stringify(a) === JSON.stringify(e);
        } catch {
            return actual.trim() === expected.trim();
        }
    }
}
