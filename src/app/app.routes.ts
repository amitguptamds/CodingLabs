import { Routes } from '@angular/router';
import { ProblemListComponent } from './components/problem-list/problem-list.component';
import { ProblemWorkspaceComponent } from './components/problem-workspace/problem-workspace.component';
import { VscodeWorkspaceComponent } from './components/vscode-workspace/vscode-workspace.component';
import { SessionWorkspaceComponent } from './components/session-workspace/session-workspace.component';
import { SqlWorkspaceComponent } from './components/sql-workspace/sql-workspace.component';
import { NosqlWorkspaceComponent } from './components/nosql-workspace/nosql-workspace.component';

export const routes: Routes = [
    { path: '', component: ProblemListComponent },
    { path: 'problem/:id', component: ProblemWorkspaceComponent },
    { path: 'project/:id', component: VscodeWorkspaceComponent },
    { path: 'sql/:id', component: SqlWorkspaceComponent },
    { path: 'nosql/:id', component: NosqlWorkspaceComponent },
    { path: 'session/:sessionId', component: SessionWorkspaceComponent },
    { path: '**', redirectTo: '' }
];
