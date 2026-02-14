import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProblemService } from '../../services/problem.service';
import { SqlExecutionService } from '../../services/sql-execution.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Problem, TestResult } from '../../models/problem.model';
import { TestResultsComponent } from '../test-results/test-results.component';

declare const monaco: any;

@Component({
    selector: 'app-sql-workspace',
    standalone: true,
    imports: [CommonModule, RouterLink, TestResultsComponent],
    templateUrl: './sql-workspace.component.html',
    styleUrl: './sql-workspace.component.scss'
})
export class SqlWorkspaceComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('editorContainer', { static: false }) editorContainer!: ElementRef;

    problem: Problem | null = null;
    editor: any = null;
    testResults: TestResult[] = [];
    isRunning = false;
    showResults = false;
    activeTab: 'description' | 'schema' | 'examples' = 'description';
    descriptionCollapsed = false;

    // Results panel
    testPanelHeight = 240;
    isResizing = false;
    startY = 0;
    startHeight = 0;

    // Computed
    get passedCount(): number { return this.testResults.filter(r => r.passed).length; }
    get totalCount(): number { return this.testResults.length; }
    get allPassed(): boolean { return this.totalCount > 0 && this.passedCount === this.totalCount; }

    // Query result table for display
    queryColumns: string[] = [];
    queryRows: any[][] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private problemService: ProblemService,
        private sqlExecution: SqlExecutionService,
        private analyticsService: AnalyticsService,
        private ngZone: NgZone,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.problem = this.problemService.getProblemById(id) || null;
            if (!this.problem || this.problem.questionType !== 'sql') {
                this.router.navigate(['/']);
                return;
            }
            this.analyticsService.recordAttempt(id, 'sql');
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
            language: 'sql',
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
        this.queryColumns = [];
        this.queryRows = [];
        this.cdr.detectChanges();

        const userQuery = this.editor.getValue().trim();
        const setupSQL = this.problem.setupSQL || '';

        try {
            this.testResults = await this.sqlExecution.executeSQL(
                userQuery,
                setupSQL,
                this.problem.testCases
            );

            // Try to get last query result for display
            await this.runQueryForDisplay(userQuery, setupSQL);
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
            userCode: userQuery,
        });

        this.isRunning = false;
        this.cdr.detectChanges();
    }

    private async runQueryForDisplay(query: string, setupSQL: string): Promise<void> {
        try {
            await this.sqlExecution.ensureLoaded();
            const SQL = (this.sqlExecution as any).SQL;
            const db = new SQL.Database();
            db.run(setupSQL);
            const result = db.exec(query);
            db.close();

            if (result && result.length > 0) {
                this.queryColumns = result[0].columns;
                this.queryRows = result[0].values;
            }
        } catch {
            // Ignore display errors
        }
    }

    resetCode(): void {
        if (this.editor && this.problem) {
            this.editor.setValue(this.problem.boilerplateCode);
            this.showResults = false;
            this.testResults = [];
            this.queryColumns = [];
            this.queryRows = [];
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

    getFormattedSchema(): string {
        if (!this.problem?.setupSQL) return '';
        // Extract CREATE TABLE and comment lines for display
        return this.problem.setupSQL
            .split(';')
            .filter(s => s.trim().toUpperCase().startsWith('CREATE'))
            .map(s => s.trim() + ';')
            .join('\n\n');
    }
}
