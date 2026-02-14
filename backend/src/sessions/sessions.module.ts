import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { WorkspaceModule } from '../workspace/workspace.module';
import { Judge0Module } from '../judge0/judge0.module';
import { ProblemsModule } from '../problems/problems.module';

@Module({
    imports: [WorkspaceModule, Judge0Module, ProblemsModule],
    controllers: [SessionsController],
    providers: [SessionsService],
    exports: [SessionsService],
})
export class SessionsModule { }
