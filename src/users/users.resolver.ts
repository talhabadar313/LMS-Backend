import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import {
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';
import { RequestPasswordResetInput } from './dto/request-password.input';
import { ResetPasswordInput } from './dto/reset-password';
import { WatchlistUserInput } from './dto/watchlist-user-input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    const { batchId, role, ...userData } = createUserInput;

    if (role === 'student' && !batchId) {
      throw new Error('Batch ID is required for students and teachers');
    }

    const userCreateData = {
      ...userData,
      role,
      batchId,
    };

    return this.usersService.create(userCreateData);
  }

  @Query(() => [User], { name: 'users' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'userByEmail' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findOneByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher', 'student')
  findOne(@Args('id', { type: () => String }) user_id: string) {
    return this.usersService.findOne(user_id);
  }

  @Query(() => User, { name: 'studentCompleteData' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher', 'student')
  async findStudentCompleteData(
    @Args('userId', { type: () => String }) userId: string,
  ) {
    return this.usersService.findStudentCompleteData(userId);
  }

  @Query(() => User, { name: 'studentProgressData' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher', 'student')
  async findStudentProgressData(
    @Args('userId', { type: () => String }) userId: string,
  ) {
    return this.usersService.findStudentProgressData(userId);
  }

  @Query(() => [User], { name: 'teachers' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findTeachers() {
    return this.usersService.findTeachers();
  }
  @Mutation(() => User, { name: 'updateUser' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher', 'student')
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.user_id, updateUserInput);
  }

  @Mutation(() => String)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  async removeUser(
    @Args('id', { type: () => String }) id: string,
  ): Promise<string> {
    await this.usersService.remove(id);
    return `User with id ${id} has been removed`;
  }

  @Mutation(() => Boolean)
  async requestPasswordReset(
    @Args('input') requestPasswordResetInput: RequestPasswordResetInput,
  ): Promise<boolean> {
    try {
      await this.usersService.requestPasswordReset(
        requestPasswordResetInput.email,
      );
      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Error processing password reset request');
    }
  }

  @Mutation(() => Boolean, { name: 'resetStudentPassword' })
  async resetPassword(
    @Args('input') resetPasswordInput: ResetPasswordInput,
  ): Promise<boolean> {
    try {
      await this.usersService.resetPassword(
        resetPasswordInput.user_id,
        resetPasswordInput.oldPassword,
        resetPasswordInput.newPassword,
      );
      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error resetting password');
    }
  }

  @Mutation(() => User, { name: 'moveStudentToWatchList' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  async moveToWatchList(
    @Args('watchListUserInput') watchListUserInput: WatchlistUserInput,
  ): Promise<User> {
    return this.usersService.moveToWatchList(watchListUserInput);
  }

  @Mutation(() => User, { name: 'removeStudentFromWatchList' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  async removeFromWatchList(@Args('userId') userId: string): Promise<User> {
    return this.usersService.removeFromWatchList(userId);
  }

  @Mutation(() => User, { name: 'teminateStudent' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  async terminateStudent(@Args('userId') userId: string): Promise<User> {
    return this.usersService.terminateStudent(userId);
  }
}
