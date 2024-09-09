import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/role.guard';
import { Roles } from '../auth/role.decorator';


@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('admin', 'teacher')
  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    const { batchId, role, ...userData } = createUserInput;
  
    if ((role === 'student') && !batchId) {
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
  @Roles('admin', 'teacher')
  findOne(@Args('id', { type: () => String }) user_id: string) {
    return this.usersService.findOne(user_id);
  }

  @Query(() => [User], { name: 'teachers' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  findTeachers() {
   return this.usersService.findTeachers()
  }
  @Mutation(() => User)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin', 'teacher')
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.user_id, updateUserInput);
  }

  @Mutation(() => String)
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'teacher')
async removeUser(@Args('id', { type: () => String }) id: string): Promise<string> {
    await this.usersService.remove(id);
    return `User with id ${id} has been removed`;
}

}