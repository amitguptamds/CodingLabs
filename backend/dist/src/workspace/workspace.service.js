"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkspaceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CODE_SERVER_WORKSPACE_ROOT = path.resolve(__dirname, '..', '..', '..', '..', 'workspaces');
let WorkspaceService = WorkspaceService_1 = class WorkspaceService {
    config;
    baseDir;
    logger = new common_1.Logger(WorkspaceService_1.name);
    constructor(config) {
        this.config = config;
        this.baseDir = this.config.get('WORKSPACE_DIR', path.join(process.cwd(), 'workspaces'));
        fs.mkdirSync(this.baseDir, { recursive: true });
    }
    async initWorkspace(candidateId, problemId, templateFiles) {
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
    async getWorkspaceFiles(sessionPath) {
        const fullPath = path.join(this.baseDir, sessionPath);
        if (!fs.existsSync(fullPath)) {
            return [];
        }
        return this.readDirRecursive(fullPath, fullPath);
    }
    async saveFile(sessionPath, filePath, content) {
        const fullPath = path.join(this.baseDir, sessionPath, filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
    }
    async seedTemplate(problemId, files) {
        const templatePath = path.join(this.baseDir, 'templates', problemId);
        fs.mkdirSync(templatePath, { recursive: true });
        for (const file of files) {
            const filePath = path.join(templatePath, file.path);
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, file.content, 'utf-8');
        }
        this.logger.log(`Template seeded: templates/${problemId}/ (${files.length} files)`);
    }
    async getCodeServerFiles(problemId) {
        const csPath = path.join(CODE_SERVER_WORKSPACE_ROOT, problemId);
        if (!fs.existsSync(csPath)) {
            return null;
        }
        this.logger.log(`Reading code-server workspace: ${csPath}`);
        return this.readDirRecursive(csPath, csPath);
    }
    async getSessionWorkspaceFiles(sessionId) {
        const sessionPath = path.join(this.baseDir, 'sessions', sessionId);
        if (!fs.existsSync(sessionPath)) {
            return null;
        }
        this.logger.log(`Reading session workspace: ${sessionPath}`);
        return this.readDirRecursive(sessionPath, sessionPath);
    }
    async getPresignedUploadUrl(sessionPath, filePath) {
        return `http://localhost:3000/api/sessions/upload/${sessionPath}/${filePath}`;
    }
    async getPresignedDownloadUrl(sessionPath, filePath) {
        return `http://localhost:3000/api/sessions/download/${sessionPath}/${filePath}`;
    }
    readDirRecursive(dir, rootDir) {
        const files = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...this.readDirRecursive(fullPath, rootDir));
            }
            else {
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
    extToLanguage(ext) {
        const map = {
            js: 'javascript',
            ts: 'typescript',
            py: 'python',
            java: 'java',
            json: 'json',
        };
        return map[ext] || 'plaintext';
    }
};
exports.WorkspaceService = WorkspaceService;
exports.WorkspaceService = WorkspaceService = WorkspaceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WorkspaceService);
//# sourceMappingURL=workspace.service.js.map