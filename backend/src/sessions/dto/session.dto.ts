import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSessionDto {
    @IsString()
    @IsNotEmpty()
    problemId!: string;
}

export class SaveFileDto {
    @IsString()
    @IsNotEmpty()
    content!: string;
}

export class ExternalSessionDto {
    @IsString()
    @IsNotEmpty()
    sessionId!: string;

    @IsString()
    @IsNotEmpty()
    questionId!: string;

    @IsString()
    @IsNotEmpty()
    candidateId!: string;
}
