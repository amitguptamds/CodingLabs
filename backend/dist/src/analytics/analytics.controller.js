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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const analytics_service_1 = require("./analytics.service");
class RecordAttemptDto {
    sessionId;
    problemId;
    language;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttemptDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttemptDto.prototype, "problemId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordAttemptDto.prototype, "language", void 0);
class RecordTestCaseRunDto {
    sessionId;
    problemId;
    testCaseResults;
    passed;
    total;
    allPassed;
    userCode;
    executionTimeMs;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordTestCaseRunDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordTestCaseRunDto.prototype, "problemId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], RecordTestCaseRunDto.prototype, "testCaseResults", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordTestCaseRunDto.prototype, "passed", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordTestCaseRunDto.prototype, "total", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], RecordTestCaseRunDto.prototype, "allPassed", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordTestCaseRunDto.prototype, "userCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RecordTestCaseRunDto.prototype, "executionTimeMs", void 0);
let AnalyticsController = class AnalyticsController {
    analyticsService;
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async recordAttempt(dto) {
        return this.analyticsService.recordAttempt(dto);
    }
    async recordTestCaseRun(dto) {
        return this.analyticsService.recordTestCaseRun(dto);
    }
    async getAttempt(sessionId, problemId) {
        return this.analyticsService.getAttempt(sessionId, problemId);
    }
    async getProblemStats(problemId) {
        return this.analyticsService.getProblemStats(problemId);
    }
    async getSessionAttempts(sessionId) {
        return this.analyticsService.getSessionAttempts(sessionId);
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Post)('attempt'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RecordAttemptDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "recordAttempt", null);
__decorate([
    (0, common_1.Post)('run'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RecordTestCaseRunDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "recordTestCaseRun", null);
__decorate([
    (0, common_1.Get)('attempt/:sessionId/:problemId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Param)('problemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getAttempt", null);
__decorate([
    (0, common_1.Get)('problem/:problemId/stats'),
    __param(0, (0, common_1.Param)('problemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getProblemStats", null);
__decorate([
    (0, common_1.Get)('session/:sessionId'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getSessionAttempts", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('api/analytics'),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map