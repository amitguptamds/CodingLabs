import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Problem, TestResult, ProjectFile } from '../models/problem.model';

/**
 * Centralized API service for communicating with the NestJS backend.
 * All backend calls go through this service.
 */

export interface SessionResponse {
    session: {
        id: string;
        candidateId: string;
        problemId: string;
        status: string;
        workspacePath: string;
        startedAt: string;
    };
    files: ProjectFile[];
}

export interface SubmissionResponse {
    submissionId: string;
    passed: number;
    total: number;
    allPassed: boolean;
    results: TestResult[];
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private readonly baseUrl = '/api';

    constructor(private http: HttpClient) { }

    // ── Problems ──

    getProblems(): Observable<Problem[]> {
        return this.http.get<Problem[]>(`${this.baseUrl}/problems`);
    }

    getProblemById(id: string): Observable<Problem> {
        return this.http.get<Problem>(`${this.baseUrl}/problems/${id}`);
    }

    // ── Sessions ──

    createSession(problemId: string, candidateId = 'default-candidate'): Observable<SessionResponse> {
        return this.http.post<SessionResponse>(
            `${this.baseUrl}/sessions`,
            { problemId },
            { headers: { 'x-candidate-id': candidateId } }
        );
    }

    getSession(sessionId: string): Observable<SessionResponse> {
        return this.http.get<SessionResponse>(`${this.baseUrl}/sessions/${sessionId}`);
    }

    saveFile(sessionId: string, filename: string, content: string): Observable<any> {
        return this.http.put(
            `${this.baseUrl}/sessions/${sessionId}/files/${filename}`,
            { content }
        );
    }

    submitCode(sessionId: string): Observable<SubmissionResponse> {
        return this.http.post<SubmissionResponse>(
            `${this.baseUrl}/sessions/${sessionId}/submit`,
            {}
        );
    }

    getResults(sessionId: string): Observable<SubmissionResponse> {
        return this.http.get<SubmissionResponse>(
            `${this.baseUrl}/sessions/${sessionId}/results`
        );
    }

    // ── External Sessions ──

    createExternalSession(sessionId: string, questionId: string, candidateId: string): Observable<any> {
        return this.http.post<any>(
            `${this.baseUrl}/sessions/external`,
            { sessionId, questionId, candidateId }
        );
    }

    // ── Auth ──

    validateToken(token: string): Observable<{ candidateId: string; sessionToken: string }> {
        return this.http.post<{ candidateId: string; sessionToken: string }>(
            `${this.baseUrl}/auth/token`,
            { token }
        );
    }
}

