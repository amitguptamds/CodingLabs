import { Routes } from '@angular/router';
import { ProblemListComponent } from './components/problem-list/problem-list.component';
import { ProblemWorkspaceComponent } from './components/problem-workspace/problem-workspace.component';
import { VscodeWorkspaceComponent } from './components/vscode-workspace/vscode-workspace.component';

export const routes: Routes = [
    { path: '', component: ProblemListComponent },
    { path: 'problem/:id', component: ProblemWorkspaceComponent },
    { path: 'project/:id', component: VscodeWorkspaceComponent },
    { path: '**', redirectTo: '' }
];
