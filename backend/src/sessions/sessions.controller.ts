import {
    Controller,
    Get,
    Post,
    Put,
    Param,
    Body,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, SaveFileDto } from './dto/session.dto';

@Controller('api/sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    /**
     * Start a new assessment session.
     * Creates an S3 workspace with problem template files.
     */
    @Post()
    async create(
        @Body() dto: CreateSessionDto,
        @Req() req: any,
    ) {
        // In production, candidateId comes from JWT.
        // For now, use a header or default.
        const candidateId = req.headers['x-candidate-id'] || 'default-candidate';
        return this.sessionsService.create(candidateId, dto.problemId);
    }

    /**
     * Get session details including workspace files.
     */
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.sessionsService.findOne(id);
    }

    /**
     * Get presigned URL to upload a file, then save file content.
     */
    @Put(':id/files/:filename')
    async saveFile(
        @Param('id') sessionId: string,
        @Param('filename') filename: string,
        @Body() dto: SaveFileDto,
    ) {
        return this.sessionsService.saveFile(sessionId, filename, dto.content);
    }

    /**
     * Submit code for Judge0 execution.
     */
    @Post(':id/submit')
    @HttpCode(HttpStatus.OK)
    async submit(@Param('id') sessionId: string) {
        return this.sessionsService.submit(sessionId);
    }

    /**
     * Get latest submission results.
     */
    @Get(':id/results')
    async getResults(@Param('id') sessionId: string) {
        return this.sessionsService.getLatestResults(sessionId);
    }
}
