import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('token')
    async validateToken(@Body() body: { token: string }) {
        const result = await this.authService.validateToken(body.token);
        if (!result) {
            throw new UnauthorizedException('Invalid token');
        }
        return result;
    }
}
