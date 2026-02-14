"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Judge0Module = void 0;
const common_1 = require("@nestjs/common");
const judge0_service_1 = require("./judge0.service");
let Judge0Module = class Judge0Module {
};
exports.Judge0Module = Judge0Module;
exports.Judge0Module = Judge0Module = __decorate([
    (0, common_1.Module)({
        providers: [judge0_service_1.Judge0Service],
        exports: [judge0_service_1.Judge0Service],
    })
], Judge0Module);
//# sourceMappingURL=judge0.module.js.map