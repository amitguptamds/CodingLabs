import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma';
import { ProblemsModule } from './problems/problems.module';
import { SessionsModule } from './sessions/sessions.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProblemsModule,
    SessionsModule,
    AuthModule,
  ],
})
export class AppModule { }
