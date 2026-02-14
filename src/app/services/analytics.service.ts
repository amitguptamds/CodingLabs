import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

/**
 * Angular service for recording analytics events.
 * All calls are fire-and-forget — errors are silently logged.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    private readonly baseUrl = '/api/analytics';

    constructor(private http: HttpClient) { }

    /**
     * Get or generate a session ID.
     * Uses sessionStorage so reloads within the same tab share the same session.
     */
    getSessionId(): string {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Record or increment a question attempt (called on workspace init).
     */
    recordAttempt(problemId: string, language: string): void {
        const sessionId = this.getSessionId();
        this.http.post(`${this.baseUrl}/attempt`, {
            sessionId,
            problemId,
            language,
        }).subscribe({
            error: (err) => console.warn('[Analytics] Failed to record attempt:', err),
        });
    }

    /**
     * Record a test case run (called after each test execution).
     */
    recordTestCaseRun(data: {
        problemId: string;
        testCaseResults: any[];
        passed: number;
        total: number;
        allPassed: boolean;
        userCode: string;
        executionTimeMs?: number;
    }): void {
        const sessionId = this.getSessionId();
        this.http.post(`${this.baseUrl}/run`, {
            sessionId,
            ...data,
        }).subscribe({
            error: (err) => console.warn('[Analytics] Failed to record test run:', err),
        });
    }
}
