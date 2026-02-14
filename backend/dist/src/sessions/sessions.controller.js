"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsController = void 0;
const common_1 = require("@nestjs/common");
const sessions_service_1 = require("./sessions.service");
const session_dto_1 = require("./dto/session.dto");
let SessionsController = class SessionsController {
    sessionsService;
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    async create(dto, req) {
        const candidateId = req.headers['x-candidate-id'] || 'default-candidate';
        return this.sessionsService.create(candidateId, dto.problemId);
    }
    async createExternal(dto) {
        return this.sessionsService.createExternal(dto.sessionId, dto.questionId, dto.candidateId);
    }
    async findOne(id) {
        return this.sessionsService.findOne(id);
    }
    async saveFile(sessionId, filename, dto) {
        return this.sessionsService.saveFile(sessionId, filename, dto.content);
    }
    async submit(sessionId) {
        return this.sessionsService.submit(sessionId);
    }
    async getResults(sessionId) {
        return this.sessionsService.getLatestResults(sessionId);
    }
};
exports.SessionsController = SessionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [session_dto_1.CreateSessionDto, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('external'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [session_dto_1.ExternalSessionDto]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "createExternal", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/files/:filename'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, session_dto_1.SaveFileDto]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "saveFile", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "submit", null);
__decorate([
    (0, common_1.Get)(':id/results'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getResults", null);
exports.SessionsController = SessionsController = __decorate([
    (0, common_1.Controller)('api/sessions'),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService])
], SessionsController);
//# sourceMappingURL=sessions.controller.js.map