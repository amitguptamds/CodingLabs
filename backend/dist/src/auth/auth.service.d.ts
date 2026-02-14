import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private readonly prisma;
    private readonly config;
    private readonly logger;
    private readonly jwtSecret;
    constructor(prisma: PrismaService, config: ConfigService);
    validateToken(token: string): Promise<{
        candidateId: string;
        sessionToken: string;
    } | null>;
}
