import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProblemService } from '../../services/problem.service';
import { NosqlExecutionService } from '../../services/nosql-execution.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Problem, TestResult } from '../../models/problem.model';
import { TestResultsComponent } from '../test-results/test-results.component';

declare const monaco: any;

@Component({
    selector: 'app-nosql-workspace',
    standalone: true,
    imports: [CommonModule, RouterLink, TestResultsComponent],
    templateUrl: './nosql-workspace.component.html',
    styleUrl: './nosql-workspace.component.scss'
})
export class NosqlWorkspaceComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;

    problem: Problem | null = null;
    editor: any = null;
    testResults: TestResult[] = [];
    isRunning = false;
    showResults = false;
    activeTab: 'description' | 'collection' | 'examples' = 'description';
    descriptionCollapsed = false;

    // Results panel
    testPanelHeight = 280;
    isResizing = false;
    startY = 0;
    startHeight = 0;

    // Computed
    get passedCount(): number { return this.testResults.filter(r => r.passed).length; }
    get totalCount(): number { return this.testResults.length; }
    get allPassed(): boolean { return this.totalCount > 0 && this.passedCount === this.totalCount; }

    // Query result documents for display
    queryResultDocs: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private problemService: ProblemService,
        private nosqlExecution: NosqlExecutionService,
        private analyticsService: AnalyticsService,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.problem = this.problemService.getProblemById(id) || null;
            if (!this.problem || this.problem.questionType !== 'nosql') {
                this.router.navigate(['/']);
                return;
            }
            this.analyticsService.recordAttempt(id, 'nosql');
        }
    }

    ngAfterViewInit(): void {
        if (this.problem) {
            this.loadMonaco();
        }
    }

    ngOnDestroy(): void {
        if (this.editor) {
            this.editor.dispose();
        }
    }

    loadMonaco(): void {
        const onGotAmdLoader = () => {
            (window as any).require.config({
                paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' }
            });
            (window as any).require(['vs/editor/editor.main'], () => {
                this.ngZone.run(() => this.initEditor());
            });
        };

        if ((window as any).require) {
            onGotAmdLoader();
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs/loader.js';
            script.onload = onGotAmdLoader;
            document.head.appendChild(script);
        }
    }

    initEditor(): void {
        if (!this.editorContainer || !this.problem) return;

        this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
            value: this.problem.boilerplateCode,
            language: 'javascript',
            theme: 'vs-dark',
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
            lineNumbers: 'on',
            roundedSelection: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            wordWrap: 'on',
            tabSize: 2,
        });
    }

    async runTests(): Promise<void> {
        if (!this.problem || !this.editor || this.isRunning) return;

        this.isRunning = true;
        this.showResults = true;
        this.testResults = [];
        this.queryResultDocs = [];
        this.cdr.detectChanges();

        const userCode = this.editor.getValue().trim();
        const seedData = this.problem.setupSQL || '[]';

        try {
            this.testResults = await this.nosqlExecution.executeNoSQL(
                userCode,
                seedData,
                this.problem.testCases
            );

            // Get result documents for display
            this.queryResultDocs = await this.nosqlExecution.runForDisplay(userCode, seedData);
        } catch (err: any) {
            this.testResults = this.problem.testCases.map(tc => ({
                testCase: tc,
                passed: false,
                actualOutput: '',
                error: err.message || String(err),
            }));
        }

        // Record analytics
        const passed = this.testResults.filter(r => r.passed).length;
        this.analyticsService.recordTestCaseRun({
            problemId: this.problem.id,
            testCaseResults: this.testResults,
            passed,
            total: this.testResults.length,
            allPassed: passed === this.testResults.length,
            userCode: userCode,
        });

        this.isRunning = false;
        this.cdr.detectChanges();
    }

    resetCode(): void {
        if (this.editor && this.problem) {
            this.editor.setValue(this.problem.boilerplateCode);
            this.showResults = false;
            this.testResults = [];
            this.queryResultDocs = [];
        }
    }

    toggleDescription(): void {
        this.descriptionCollapsed = !this.descriptionCollapsed;
        setTimeout(() => {
            if (this.editor) this.editor.layout();
        }, 300);
    }

    startResize(event: MouseEvent): void {
        this.isResizing = true;
        this.startY = event.clientY;
        this.startHeight = this.testPanelHeight;
        event.preventDefault();
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.isResizing) return;
        const delta = this.startY - event.clientY;
        this.testPanelHeight = Math.max(120, Math.min(600, this.startHeight + delta));
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

    getFormattedCollection(): string {
        if (!this.problem?.setupSQL) return '[]';
        try {
            const docs = JSON.parse(this.problem.setupSQL);
            return JSON.stringify(docs, null, 2);
        } catch {
            return this.problem.setupSQL;
        }
    }

    getCollectionCount(): number {
        try {
            return JSON.parse(this.problem?.setupSQL || '[]').length;
        } catch {
            return 0;
        }
    }

    formatDocument(doc: any): string {
        return JSON.stringify(doc, null, 2);
    }
}
