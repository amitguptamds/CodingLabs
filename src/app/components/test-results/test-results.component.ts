import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestResult } from '../../models/problem.model';

@Component({
    selector: 'app-test-results',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './test-results.component.html',
    styleUrl: './test-results.component.scss'
})
export class TestResultsComponent {
    @Input() results: TestResult[] = [];
    @Input() isRunning = false;
}
