import { ConfigService } from '@nestjs/config';
export interface ProjectFile {
    name: string;
    path: string;
    language: string;
    content: string;
    isReadOnly?: boolean;
}
export declare class WorkspaceService {
    private readonly config;
    private readonly baseDir;
    private readonly logger;
    constructor(config: ConfigService);
    initWorkspace(candidateId: string, problemId: string, templateFiles: ProjectFile[]): Promise<string>;
    getWorkspaceFiles(sessionPath: string): Promise<ProjectFile[]>;
    saveFile(sessionPath: string, filePath: string, content: string): Promise<void>;
    seedTemplate(problemId: string, files: ProjectFile[]): Promise<void>;
    getCodeServerFiles(problemId: string): Promise<ProjectFile[] | null>;
    getSessionWorkspaceFiles(sessionId: string): Promise<ProjectFile[] | null>;
    getPresignedUploadUrl(sessionPath: string, filePath: string): Promise<string>;
    getPresignedDownloadUrl(sessionPath: string, filePath: string): Promise<string>;
    private readDirRecursive;
    private extToLanguage;
}
