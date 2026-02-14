import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProblemService } from '../../services/problem.service';
import { ApiService, SessionResponse } from '../../services/api.service';
import { CodeExecutionService } from '../../services/code-execution.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Problem, TestResult, ProjectFile } from '../../models/problem.model';
import { TestResultsComponent } from '../test-results/test-results.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-vscode-workspace',
    standalone: true,
    imports: [CommonModule, RouterLink, TestResultsComponent],
    templateUrl: './vscode-workspace.component.html',
    styleUrl: './vscode-workspace.component.scss'
})
export class VscodeWorkspaceComponent implements OnInit, OnDestroy {
    problem: Problem | null = null;
    codeServerUrl: SafeResourceUrl | null = null;
    codeServerReady = false;
    codeServerError = false;

    testResults: TestResult[] = [];
    isRunning = false;
    showResults = false;
    activeTab: 'description' | 'examples' | 'files' = 'description';
    passedCount = 0;
    totalCount = 0;
    allPassed = false;

    // Local editable copies of files
    editableFiles: ProjectFile[] = [];
    activeFileIndex = 0;

    // Panel state
    descriptionCollapsed = false;
    testPanelHeight = 240;
    private isResizing = false;
    private resizeStartY = 0;
    private resizeStartHeight = 0;

    // Backend session
    sessionId: string | null = null;
    private useBackend = true;

    private checkInterval: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private problemService: ProblemService,
        private apiService: ApiService,
        private codeExecutionService: CodeExecutionService,
        private analyticsService: AnalyticsService,
        private sanitizer: DomSanitizer,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.problem = this.problemService.getProblemById(id) ?? null;
            if (!this.problem || !this.problem.isMultiFile) {
                this.router.navigate(['/']);
                return;
            }

            // Clone files for editing (local fallback)
            this.editableFiles = this.problem.files!.map(f => ({ ...f }));

            // Record analytics attempt
            this.analyticsService.recordAttempt(id, this.problem?.language || 'javascript');

            // Try to create a backend session
            if (this.useBackend) {
                this.initBackendSession(id);
            }

            // Set code-server URL (still used for the embedded editor iframe)
            this.codeServerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                `http://localhost:8443/?folder=/Users/amit/VSCodeWeb-Angular/workspaces/${id}`
            );
            this.checkCodeServer();
        }
    }

    ngOnDestroy(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }

    /**
     * Initialize a backend session and load workspace files from the server.
     */
    private initBackendSession(problemId: string): void {
        this.apiService.createSession(problemId).subscribe({
            next: (response: SessionResponse) => {
                this.sessionId = response.session.id;
                if (response.files && response.files.length > 0) {
                    this.editableFiles = response.files.map(f => ({ ...f }));
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.warn('Backend unavailable, using local execution:', err.message);
                this.useBackend = false;
            }
        });
    }

    private async checkCodeServer(): Promise<void> {
        try {
            await fetch('http://localhost:8443/healthz', { method: 'GET', mode: 'no-cors' });
            this.ngZone.run(() => {
                this.codeServerReady = true;
                this.codeServerError = false;
                this.cdr.detectChanges();
            });
        } catch {
            this.ngZone.run(() => {
                this.codeServerReady = false;
                this.codeServerError = true;
                this.cdr.detectChanges();
            });

            this.checkInterval = setInterval(async () => {
                try {
                    await fetch('http://localhost:8443/healthz', { method: 'GET', mode: 'no-cors' });
                    this.ngZone.run(() => {
                        this.codeServerReady = true;
                        this.codeServerError = false;
                        this.cdr.detectChanges();
                    });
                    clearInterval(this.checkInterval);
                } catch { }
            }, 3000);
        }
    }

    runTests(): void {
        if (!this.problem || this.isRunning) return;

        this.isRunning = true;
        this.showResults = true;
        this.testResults = [];
        this.cdr.detectChanges();

        if (this.useBackend && this.sessionId) {
            this.runTestsViaBackend();
        } else {
            this.runTestsLocally();
        }
    }

    /**
     * Submit code to the backend: save files → submit → get results from Judge0.
     */
    private runTestsViaBackend(): void {
        // When code-server is active, skip saving editableFiles (they may be stale).
        // The backend will read directly from the code-server workspace directory.
        const submitFn = () => {
            this.apiService.submitCode(this.sessionId!).subscribe({
                next: (response) => {
                    this.ngZone.run(() => {
                        this.testResults = response.results;
                        this.passedCount = response.passed;
                        this.totalCount = response.total;
                        this.allPassed = response.allPassed;
                        this.isRunning = false;
                        this.cdr.detectChanges();
                        this.analyticsService.recordTestCaseRun({
                            problemId: this.problem!.id,
                            testCaseResults: response.results,
                            passed: response.passed,
                            total: response.total,
                            allPassed: response.allPassed,
                            userCode: this.editableFiles.map(f => f.content).join('\n---\n'),
                        });
                    });
                },
                error: (err) => {
                    console.error('Backend submission failed, falling back to local:', err);
                    this.useBackend = false;
                    this.runTestsLocally();
                }
            });
        };

        if (this.codeServerReady) {
            // Code-server is active — backend reads files directly from code-server workspace
            submitFn();
        } else {
            // Fallback editor — save editable files to session first, then submit
            const savePromises = this.editableFiles.map(f =>
                this.apiService.saveFile(this.sessionId!, f.name, f.content).toPromise()
            );
            Promise.all(savePromises).then(() => submitFn()).catch((err) => {
                console.error('File save failed:', err);
                this.runTestsLocally();
            });
        }
    }

    /**
     * Fallback: run tests locally in the browser sandbox.
     */
    private runTestsLocally(): void {
        setTimeout(() => {
            this.ngZone.run(() => {
                this.testResults = this.codeExecutionService.executeMultiFileCode(
                    this.editableFiles,
                    'index.js',
                    this.problem!.testCases
                );

                this.passedCount = this.testResults.filter(r => r.passed).length;
                this.totalCount = this.testResults.length;
                this.allPassed = this.passedCount === this.totalCount;
                this.isRunning = false;
                this.cdr.detectChanges();
            });
        }, 600);
    }

    resetCode(): void {
        if (this.problem?.files) {
            this.editableFiles = this.problem.files.map(f => ({ ...f }));
            this.testResults = [];
            this.showResults = false;
            this.cdr.detectChanges();
        }
    }

    setActiveFile(index: number): void {
        this.activeFileIndex = index;
    }

    onFileContentChange(index: number, content: string): void {
        this.editableFiles[index].content = content;
    }

    getDifficultyClass(): string {
        switch (this.problem?.difficulty) {
            case 'Easy': return 'badge-easy';
            case 'Medium': return 'badge-medium';
            case 'Hard': return 'badge-hard';
            default: return '';
        }
    }

    getFileIcon(fileName: string): string {
        if (fileName.endsWith('.js')) return '⟨⟩';
        if (fileName.endsWith('.json')) return '{ }';
        if (fileName.endsWith('.ts')) return 'TS';
        return '📄';
    }

    toggleDescription(): void {
        this.descriptionCollapsed = !this.descriptionCollapsed;
    }

    startResize(event: MouseEvent): void {
        this.isResizing = true;
        this.resizeStartY = event.clientY;
        this.resizeStartHeight = this.testPanelHeight;
        event.preventDefault();
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.isResizing) return;
        const delta = this.resizeStartY - event.clientY;
        this.testPanelHeight = Math.max(120, Math.min(500, this.resizeStartHeight + delta));
    }

    @HostListener('document:mouseup')
    onMouseUp(): void {
        this.isResizing = false;
    }
}
