import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProjectFile } from '../models/problem.model';

@Injectable({
    providedIn: 'root'
})
export class WorkspaceService {
    private readonly CODE_SERVER_PORT = 8443;
    private readonly WORKSPACE_BASE = '/Users/amit/VSCodeWeb-Angular/workspaces';

    constructor(private sanitizer: DomSanitizer) { }

    /**
     * Get the sanitized code-server iframe URL for a problem workspace
     */
    getCodeServerUrl(problemId: string): SafeResourceUrl {
        const workspacePath = `${this.WORKSPACE_BASE}/${problemId}`;
        const url = `http://localhost:${this.CODE_SERVER_PORT}/?folder=${encodeURIComponent(workspacePath)}`;
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }

    /**
     * Get a raw (unsanitized) code-server URL — used for fetch/status checks
     */
    getRawCodeServerUrl(): string {
        return `http://localhost:${this.CODE_SERVER_PORT}`;
    }

    /**
     * Check if code-server is running
     */
    async isCodeServerRunning(): Promise<boolean> {
        try {
            const response = await fetch(`http://localhost:${this.CODE_SERVER_PORT}/healthz`, {
                method: 'GET',
                mode: 'no-cors'
            });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get the workspace path for a problem
     */
    getWorkspacePath(problemId: string): string {
        return `${this.WORKSPACE_BASE}/${problemId}`;
    }
}
