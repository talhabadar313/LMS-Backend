import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from './auth.constants';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthGuard } from './auth.guard';
import { CandidatesModule } from '../candidates/candidates.module';

@Module({
  imports: [
    forwardRef(() => UsersModule), 
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
    forwardRef(() => CandidatesModule), 
  ],
  providers: [AuthService, AuthResolver, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
