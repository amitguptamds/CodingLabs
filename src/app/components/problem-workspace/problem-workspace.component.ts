import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProblemService } from '../../services/problem.service';
import { ApiService, SessionResponse } from '../../services/api.service';
import { CodeExecutionService } from '../../services/code-execution.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Problem, TestResult } from '../../models/problem.model';
import { TestResultsComponent } from '../test-results/test-results.component';

// Declare monaco as a global
declare const monaco: any;

@Component({
    selector: 'app-problem-workspace',
    standalone: true,
    imports: [CommonModule, RouterLink, TestResultsComponent],
    templateUrl: './problem-workspace.component.html',
    styleUrl: './problem-workspace.component.scss'
})
export class ProblemWorkspaceComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;

    problem: Problem | null = null;
    editor: any = null;
    testResults: TestResult[] = [];
    isRunning = false;
    showResults = false;
    activeTab: 'description' | 'examples' = 'description';
    passedCount = 0;
    totalCount = 0;
    allPassed = false;

    // Panel state
    descriptionCollapsed = false;
    testPanelHeight = 240;
    private isResizing = false;
    private resizeStartY = 0;
    private resizeStartHeight = 0;

    // Backend session
    sessionId: string | null = null;
    private useBackend = true;

    private monacoLoadInterval: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private problemService: ProblemService,
        private apiService: ApiService,
        private codeExecutionService: CodeExecutionService,
        private analyticsService: AnalyticsService,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.problem = this.problemService.getProblemById(id) ?? null;
            if (!this.problem) {
                this.router.navigate(['/']);
                return;
            }

            // Record analytics attempt
            this.analyticsService.recordAttempt(id, this.problem?.language || 'javascript');

            // Try to create a backend session
            if (this.useBackend) {
                this.initBackendSession(id);
            }
        }
    }

    ngAfterViewInit(): void {
        this.loadMonaco();
    }

    ngOnDestroy(): void {
        if (this.editor) {
            this.editor.dispose();
        }
        if (this.monacoLoadInterval) {
            clearInterval(this.monacoLoadInterval);
        }
    }

    /**
     * Initialize a backend session for this problem.
     */
    private initBackendSession(problemId: string): void {
        this.apiService.createSession(problemId).subscribe({
            next: (response: SessionResponse) => {
                this.sessionId = response.session.id;
            },
            error: (err) => {
                console.warn('Backend unavailable, using local execution:', err.message);
                this.useBackend = false;
            }
        });
    }

    private loadMonaco(): void {
        if (typeof monaco !== 'undefined') {
            this.initEditor();
            return;
        }

        const onGotAmdLoader = () => {
            (window as any).require.config({
                paths: { vs: 'assets/monaco-editor/min/vs' }
            });

            (window as any).require(['vs/editor/editor.main'], () => {
                this.ngZone.run(() => {
                    this.initEditor();
                });
            });
        };

        if (!(window as any).require) {
            const loaderScript = document.createElement('script');
            loaderScript.type = 'text/javascript';
            loaderScript.src = 'assets/monaco-editor/min/vs/loader.js';
            loaderScript.addEventListener('load', onGotAmdLoader);
            document.body.appendChild(loaderScript);
        } else {
            onGotAmdLoader();
        }
    }

    private initEditor(): void {
        if (!this.editorContainer || !this.problem) return;

        monaco.editor.defineTheme('codearena-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'C792EA' },
                { token: 'string', foreground: 'C3E88D' },
                { token: 'number', foreground: 'F78C6C' },
                { token: 'type', foreground: 'FFCB6B' },
                { token: 'function', foreground: '82AAFF' },
            ],
            colors: {
                'editor.background': '#0d1117',
                'editor.foreground': '#e6edf3',
                'editor.lineHighlightBackground': '#161b22',
                'editor.selectionBackground': '#264f78',
                'editorCursor.foreground': '#7b2ff7',
                'editorLineNumber.foreground': '#484f58',
                'editorLineNumber.activeForeground': '#7b2ff7',
                'editor.inactiveSelectionBackground': '#1c2333',
                'editorIndentGuide.background': '#1c2333',
                'editorWidget.background': '#161b22',
                'editorWidget.border': '#30363d',
                'editorSuggestWidget.background': '#161b22',
                'editorSuggestWidget.border': '#30363d',
                'editorSuggestWidget.selectedBackground': '#1c2333',
            }
        });

        this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
            value: this.problem.boilerplateCode,
            language: 'javascript',
            theme: 'codearena-dark',
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, monospace",
            fontLigatures: true,
            minimap: { enabled: true, scale: 1 },
            padding: { top: 16, bottom: 16 },
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                useShadows: false
            },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true }
        });
    }

    runTests(): void {
        if (!this.problem || !this.editor || this.isRunning) return;

        this.isRunning = true;
        this.showResults = true;
        this.testResults = [];
        this.cdr.detectChanges();

        const userCode = this.editor.getValue();

        if (this.useBackend && this.sessionId) {
            this.runTestsViaBackend(userCode);
        } else {
            this.runTestsLocally(userCode);
        }
    }

    /**
     * Submit code to the backend: save the solution file → submit → get results.
     */
    private runTestsViaBackend(userCode: string): void {
        const filename = 'solution.js';

        // Save the user's code to the backend workspace
        this.apiService.saveFile(this.sessionId!, filename, userCode).subscribe({
            next: () => {
                // Submit for Judge0 execution
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
                                userCode,
                            });
                        });
                    },
                    error: (err) => {
                        console.error('Backend submission failed, falling back to local:', err);
                        this.useBackend = false;
                        this.runTestsLocally(userCode);
                    }
                });
            },
            error: (err) => {
                console.error('File save failed:', err);
                this.runTestsLocally(userCode);
            }
        });
    }

    /**
     * Fallback: run tests locally in the browser sandbox.
     */
    private runTestsLocally(userCode: string): void {
        setTimeout(() => {
            this.ngZone.run(() => {
                this.testResults = this.codeExecutionService.executeCode(
                    userCode,
                    this.problem!.solutionTemplate,
                    this.problem!.testCases
                );

                this.passedCount = this.testResults.filter(r => r.passed).length;
                this.totalCount = this.testResults.length;
                this.allPassed = this.passedCount === this.totalCount;
                this.isRunning = false;
                this.cdr.detectChanges();
                this.analyticsService.recordTestCaseRun({
                    problemId: this.problem!.id,
                    testCaseResults: this.testResults,
                    passed: this.passedCount,
                    total: this.totalCount,
                    allPassed: this.allPassed,
                    userCode,
                });
            });
        }, 600);
    }

    resetCode(): void {
        if (this.editor && this.problem) {
            this.editor.setValue(this.problem.boilerplateCode);
            this.testResults = [];
            this.showResults = false;
        }
    }

    toggleDescription(): void {
        this.descriptionCollapsed = !this.descriptionCollapsed;
        // Trigger editor relayout after transition
        setTimeout(() => {
            if (this.editor) {
                this.editor.layout();
            }
        }, 320);
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
        if (this.editor) {
            this.editor.layout();
        }
    }

    @HostListener('document:mouseup')
    onMouseUp(): void {
        this.isResizing = false;
    }

    getDifficultyClass(): string {
        switch (this.problem?.difficulty) {
            case 'Easy': return 'badge-easy';
            case 'Medium': return 'badge-medium';
            case 'Hard': return 'badge-hard';
            default: return '';
        }
    }
}
