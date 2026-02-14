import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * The code-server workspace root — where code-server edits files.
 * This is separate from the session workspace used by the backend.
 */
const CODE_SERVER_WORKSPACE_ROOT = path.resolve(
    __dirname, '..', '..', '..', '..', 'workspaces',
);

export interface ProjectFile {
    name: string;
    path: string;
    language: string;
    content: string;
    isReadOnly?: boolean;
}

@Injectable()
export class WorkspaceService {
    private readonly baseDir: string;
    private readonly logger = new Logger(WorkspaceService.name);

    constructor(private readonly config: ConfigService) {
        this.baseDir = this.config.get<string>(
            'WORKSPACE_DIR',
            path.join(process.cwd(), 'workspaces'),
        );
        // Ensure base directory exists
        fs.mkdirSync(this.baseDir, { recursive: true });
    }

    /**
     * Initialize a workspace by copying template files to a session-specific directory.
     */
    async initWorkspace(
        candidateId: string,
        problemId: string,
        templateFiles: ProjectFile[],
    ): Promise<string> {
        const sessionPath = `sessions/${candidateId}/${problemId}`;
        const fullPath = path.join(this.baseDir, sessionPath);
        fs.mkdirSync(fullPath, { recursive: true });

        for (const file of templateFiles) {
            const filePath = path.join(fullPath, file.path);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, file.content, 'utf-8');
        }

        this.logger.log(`Workspace initialized: ${sessionPath} (${templateFiles.length} files)`);
        return sessionPath;
    }

    /**
     * Read all files in the workspace.
     */
    async getWorkspaceFiles(sessionPath: string): Promise<ProjectFile[]> {
        const fullPath = path.join(this.baseDir, sessionPath);
        if (!fs.existsSync(fullPath)) {
            return [];
        }
        return this.readDirRecursive(fullPath, fullPath);
    }

    /**
     * Save a file to the workspace.
     */
    async saveFile(
        sessionPath: string,
        filePath: string,
        content: string,
    ): Promise<void> {
        const fullPath = path.join(this.baseDir, sessionPath, filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
    }

    /**
     * Seed problem templates to workspaces/templates/{problemId}/
     */
    async seedTemplate(
        problemId: string,
        files: ProjectFile[],
    ): Promise<void> {
        const templatePath = path.join(this.baseDir, 'templates', problemId);
        fs.mkdirSync(templatePath, { recursive: true });

        for (const file of files) {
            const filePath = path.join(templatePath, file.path);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, file.content, 'utf-8');
        }
        this.logger.log(`Template seeded: templates/${problemId}/ (${files.length} files)`);
    }

    /**
     * Read files from the code-server workspace for a multi-file problem.
     * Returns null if the code-server workspace doesn't exist.
     */
    async getCodeServerFiles(problemId: string): Promise<ProjectFile[] | null> {
        const csPath = path.join(CODE_SERVER_WORKSPACE_ROOT, problemId);
        if (!fs.existsSync(csPath)) {
            return null;
        }
        this.logger.log(`Reading code-server workspace: ${csPath}`);
        return this.readDirRecursive(csPath, csPath);
    }

    /**
     * Read files from a session-specific workspace.
     * Used for external sessions where each session has its own workspace.
     */
    async getSessionWorkspaceFiles(sessionId: string): Promise<ProjectFile[] | null> {
        const sessionPath = path.join(this.baseDir, 'sessions', sessionId);
        if (!fs.existsSync(sessionPath)) {
            return null;
        }
        this.logger.log(`Reading session workspace: ${sessionPath}`);
        return this.readDirRecursive(sessionPath, sessionPath);
    }

    // --- Presigned URL stubs (not needed for local dev) ---

    async getPresignedUploadUrl(sessionPath: string, filePath: string): Promise<string> {
        return `http://localhost:3000/api/sessions/upload/${sessionPath}/${filePath}`;
    }

    async getPresignedDownloadUrl(sessionPath: string, filePath: string): Promise<string> {
        return `http://localhost:3000/api/sessions/download/${sessionPath}/${filePath}`;
    }

    // --- Helpers ---

    private readDirRecursive(dir: string, rootDir: string): ProjectFile[] {
        const files: ProjectFile[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...this.readDirRecursive(fullPath, rootDir));
            } else {
                const relativePath = path.relative(rootDir, fullPath);
                const ext = entry.name.split('.').pop() || '';
                files.push({
                    name: entry.name,
                    path: relativePath,
                    language: this.extToLanguage(ext),
                    content: fs.readFileSync(fullPath, 'utf-8'),
                });
            }
        }
        return files;
    }

    private extToLanguage(ext: string): string {
        const map: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            py: 'python',
            java: 'java',
            json: 'json',
        };
        return map[ext] || 'plaintext';
    }
}
