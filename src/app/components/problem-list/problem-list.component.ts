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
}
