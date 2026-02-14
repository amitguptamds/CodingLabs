import { Injectable } from '@angular/core';
import { Problem } from '../models/problem.model';
import { problems } from './problems';

@Injectable({
  providedIn: 'root'
})
export class ProblemService {

  private problems: Problem[] = problems;

  getProblems(): Problem[] {
    return this.problems;
  }

  getProblemById(id: string): Problem | undefined {
    return this.problems.find(p => p.id === id);
  }

  getProblemsByDifficulty(difficulty: string): Problem[] {
    return this.problems.filter(p => p.difficulty === difficulty);
  }

  searchProblems(query: string): Problem[] {
    const q = query.toLowerCase();
    return this.problems.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }
}
