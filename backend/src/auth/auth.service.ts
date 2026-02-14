import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly jwtSecret: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) {
        this.jwtSecret = this.config.get<string>('JWT_SECRET', 'codearena-secret-key');
    }

    /**
     * Validate a candidate token and return a simple JWT-like session token.
     * In production, use proper passport-jwt. This is a simplified version.
     */
    async validateToken(token: string): Promise<{ candidateId: string; sessionToken: string } | null> {
        const candidate = await this.prisma.candidate.findUnique({
            where: { token },
        });

        if (!candidate) {
            return null;
        }

        // Generate a simple signed token
        const payload = JSON.stringify({
            candidateId: candidate.id,
            email: candidate.email,
            iat: Date.now(),
        });
        const signature = crypto
            .createHmac('sha256', this.jwtSecret)
            .update(payload)
            .digest('hex');
        const sessionToken = Buffer.from(payload).toString('base64') + '.' + signature;

        return {
            candidateId: candidate.id,
            sessionToken,
        };
    }
}
