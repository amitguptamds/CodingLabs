import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { IsString, IsNumber, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { AnalyticsService } from './analytics.service';

class RecordAttemptDto {
    @IsString()
    sessionId!: string;

    @IsString()
    problemId!: string;

    @IsString()
    language!: string;
}

class RecordTestCaseRunDto {
    @IsString()
    sessionId!: string;

    @IsString()
    problemId!: string;

    @IsArray()
    testCaseResults!: any[];

    @IsNumber()
    passed!: number;

    @IsNumber()
    total!: number;

    @IsBoolean()
    allPassed!: boolean;

    @IsString()
    userCode!: string;

    @IsOptional()
    @IsNumber()
    executionTimeMs?: number;
}

@Controller('api/analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    /**
     * Record or increment a question attempt.
     */
    @Post('attempt')
    @HttpCode(HttpStatus.OK)
    async recordAttempt(@Body() dto: RecordAttemptDto) {
        return this.analyticsService.recordAttempt(dto);
    }

    /**
     * Record a test case run for an attempt.
     */
    @Post('run')
    @HttpCode(HttpStatus.OK)
    async recordTestCaseRun(@Body() dto: RecordTestCaseRunDto) {
        return this.analyticsService.recordTestCaseRun(dto);
    }

    /**
     * Get attempt details for a session + problem.
     */
    @Get('attempt/:sessionId/:problemId')
    async getAttempt(
        @Param('sessionId') sessionId: string,
        @Param('problemId') problemId: string,
    ) {
        return this.analyticsService.getAttempt(sessionId, problemId);
    }

    /**
     * Get aggregate stats for a problem.
     */
    @Get('problem/:problemId/stats')
    async getProblemStats(@Param('problemId') problemId: string) {
        return this.analyticsService.getProblemStats(problemId);
    }

    /**
     * Get all attempts for a session.
     */
    @Get('session/:sessionId')
    async getSessionAttempts(@Param('sessionId') sessionId: string) {
        return this.analyticsService.getSessionAttempts(sessionId);
    }
}
