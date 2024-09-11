import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from '../users/dto/login-user.input';
import { LoginResponse } from './auth.schema';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<LoginResponse> {
    const { accessToken, user, needsPasswordReset } = await this.authService.login(loginInput);
    return { accessToken, user , needsPasswordReset};
  }
}
