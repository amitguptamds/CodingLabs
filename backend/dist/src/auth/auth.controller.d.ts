import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    validateToken(body: {
        token: string;
    }): Promise<{
        candidateId: string;
        sessionToken: string;
    }>;
}
