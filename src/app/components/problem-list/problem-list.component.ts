import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProblemService } from '../../services/problem.service';
import { Problem } from '../../models/problem.model';

@Component({
    selector: 'app-problem-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './problem-list.component.html',
    styleUrl: './problem-list.component.scss'
})
export class ProblemListComponent implements OnInit {
    problems: Problem[] = [];
    filteredProblems: Problem[] = [];
    searchQuery = '';
    selectedDifficulty = 'All';
    difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    testSessions = [
        {
            sessionId: 'demo-session-1',
            questionId: 'two-sum',
            candidateId: 'test-candidate',
            label: 'Two Sum',
            language: 'javascript',
            languageLabel: 'JavaScript',
            editorType: 'Monaco',
            isMultiFile: false,
        },
        {
            sessionId: 'demo-session-2',
            questionId: 'reverse-string-python',
            candidateId: 'test-candidate',
            label: 'Reverse String (Python)',
            language: 'python',
            languageLabel: 'Python',
            editorType: 'Monaco',
            isMultiFile: false,
        },
        {
            sessionId: 'demo-session-3',
            questionId: 'reverse-string-java',
            candidateId: 'test-candidate',
            label: 'Reverse String (Java)',
            language: 'java',
            languageLabel: 'Java',
            editorType: 'Monaco',
            isMultiFile: false,
        },
        {
            sessionId: 'demo-session-4',
            questionId: 'greeting-system',
            candidateId: 'test-candidate',
            label: 'Greeting System',
            language: 'javascript',
            languageLabel: 'JavaScript',
            editorType: 'VSCode',
            isMultiFile: true,
        },
        {
            sessionId: 'demo-session-5',
            questionId: 'python-task-manager',
            candidateId: 'test-candidate',
            label: 'Task Manager (Python)',
            language: 'python',
            languageLabel: 'Python',
            editorType: 'VSCode',
            isMultiFile: true,
        },
    ];

    constructor(private problemService: ProblemService) { }

    ngOnInit(): void {
        this.problems = this.problemService.getProblems();
        this.filteredProblems = [...this.problems];
    }

    filterProblems(): void {
        let result = this.problems;

        if (this.selectedDifficulty !== 'All') {
            result = result.filter(p => p.difficulty === this.selectedDifficulty);
        }

        if (this.searchQuery.trim()) {
            const q = this.searchQuery.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(q) ||
                p.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        this.filteredProblems = result;
    }

    onSearch(): void {
        this.filterProblems();
    }

    onDifficultyFilter(difficulty: string): void {
        this.selectedDifficulty = difficulty;
        this.filterProblems();
    }

    getDifficultyClass(difficulty: string): string {
        switch (difficulty) {
            case 'Easy': return 'badge-easy';
            case 'Medium': return 'badge-medium';
            case 'Hard': return 'badge-hard';
            default: return '';
        }
    }

    getDifficultyCount(difficulty: string): number {
        return this.problems.filter(p => p.difficulty === difficulty).length;
    }

    getProblemNumber(index: number): string {
        return String(index + 1).padStart(2, '0');
    }

    getLanguageLabel(language: string): string {
        const labels: Record<string, string> = {
            javascript: 'JavaScript',
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            typescript: 'TypeScript',
            go: 'Go',
            rust: 'Rust',
            c: 'C',
            csharp: 'C#',
            ruby: 'Ruby',
            php: 'PHP',
            kotlin: 'Kotlin',
            swift: 'Swift',
            bash: 'Bash',
            sql: 'SQL',
            nosql: 'NoSQL',
        };
        return labels[language] || language;
    }

    getRouteForProblem(problem: Problem): string {
        if (problem.questionType === 'sql') return '/sql';
        if (problem.questionType === 'nosql') return '/nosql';
        if (problem.isMultiFile) return '/project';
        return '/problem';
    }
}
