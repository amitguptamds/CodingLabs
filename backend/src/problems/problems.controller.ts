import { Controller, Get, Param } from '@nestjs/common';
import { ProblemsService } from './problems.service';

@Controller('api/problems')
export class ProblemsController {
    constructor(private readonly problemsService: ProblemsService) { }

    @Get()
    async findAll() {
        return this.problemsService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.problemsService.findOne(id);
    }
}
