import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Problem, TestResult, ProjectFile } from '../../models/problem.model';
import { TestResultsComponent } from '../test-results/test-results.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-session-workspace',
    standalone: true,
    imports: [CommonModule, TestResultsComponent],
    templateUrl: './session-workspace.component.html',
    styleUrl: './session-workspace.component.scss'
})
export class SessionWorkspaceComponent implements OnInit, OnDestroy {
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

    // External session
    sessionId: string | null = null;
    questionId: string | null = null;
    candidateId: string | null = null;
    loading = true;
    errorMsg: string | null = null;

    private checkInterval: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private apiService: ApiService,
        private sanitizer: DomSanitizer,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.sessionId = this.route.snapshot.paramMap.get('sessionId');
        this.questionId = this.route.snapshot.queryParamMap.get('questionId');
        this.candidateId = this.route.snapshot.queryParamMap.get('candidateId') || 'default-candidate';

        if (!this.sessionId || !this.questionId) {
            this.errorMsg = 'Missing sessionId or questionId. URL format: /session/:sessionId?questionId=xxx';
            this.loading = false;
            return;
        }

        this.initExternalSession();
    }

    ngOnDestroy(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }

    /**
     * Initialize via the external session API.
     * Creates or resumes a session, loads problem data from backend.
     */
    private initExternalSession(): void {
        this.apiService.createExternalSession(
            this.sessionId!,
            this.questionId!,
            this.candidateId!
        ).subscribe({
            next: (response: any) => {
                this.sessionId = response.session.id;

                // Problem data comes from the backend
                const p = response.problem;
                this.problem = {
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    difficulty: p.difficulty,
                    tags: p.tags || [],
                    boilerplateCode: p.boilerplateCode || '',
                    solutionTemplate: p.solutionTemplate || '',
                    testCases: p.testCases || [],
                    examples: p.examples || [],
                    constraints: p.constraints || [],
                    isMultiFile: p.isMultiFile,
                    files: response.files,
                };

                if (response.files && response.files.length > 0) {
                    this.editableFiles = response.files.map((f: ProjectFile) => ({ ...f }));
                }

                // Set code-server URL pointing to the session workspace
                if (this.problem.isMultiFile) {
                    this.codeServerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                        `http://localhost:8443/?folder=/Users/amit/VSCodeWeb-Angular/backend/workspaces/sessions/${this.sessionId}`
                    );
                    this.checkCodeServer();
                }

                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('External session creation failed:', err);
                this.errorMsg = `Failed to create session: ${err.error?.message || err.message}`;
                this.loading = false;
                this.cdr.detectChanges();
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
        if (!this.problem || this.isRunning || !this.sessionId) return;

        this.isRunning = true;
        this.showResults = true;
        this.testResults = [];
        this.cdr.detectChanges();

        // For external sessions, always use backend submission
        if (this.codeServerReady) {
            // Code-server active — backend reads directly from session workspace
            this.apiService.submitCode(this.sessionId).subscribe({
                next: (response) => {
                    this.ngZone.run(() => {
                        this.testResults = response.results;
                        this.passedCount = response.passed;
                        this.totalCount = response.total;
                        this.allPassed = response.allPassed;
                        this.isRunning = false;
                        this.cdr.detectChanges();
                    });
                },
                error: (err) => {
                    console.error('Submission failed:', err);
                    this.isRunning = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            // Fallback: save editable files, then submit
            const savePromises = this.editableFiles.map(f =>
                this.apiService.saveFile(this.sessionId!, f.name, f.content).toPromise()
            );
            Promise.all(savePromises).then(() => {
                this.apiService.submitCode(this.sessionId!).subscribe({
                    next: (response) => {
                        this.ngZone.run(() => {
                            this.testResults = response.results;
                            this.passedCount = response.passed;
                            this.totalCount = response.total;
                            this.allPassed = response.allPassed;
                            this.isRunning = false;
                            this.cdr.detectChanges();
                        });
                    },
                    error: (err) => {
                        console.error('Submission failed:', err);
                        this.isRunning = false;
                        this.cdr.detectChanges();
                    }
                });
            }).catch((err) => {
                console.error('File save failed:', err);
                this.isRunning = false;
                this.cdr.detectChanges();
            });
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
