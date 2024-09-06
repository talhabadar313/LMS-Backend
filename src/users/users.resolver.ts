import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';


@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin', 'teacher')
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
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin', 'teacher')
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'userByEmail' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin', 'teacher')
  findOneByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin', 'teacher')
  findOne(@Args('id', { type: () => String }) user_id: string) {
    return this.usersService.findOne(user_id);
  }

  @Query(() => [User], { name: 'teachers' })
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin', 'teacher')
  findTeachers() {
   return this.usersService.findTeachers()
  }
  @Mutation(() => User)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('admin', 'teacher')
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.user_id, updateUserInput);
  }

  @Mutation(() => String)
@UseGuards(AuthGuard, RoleGuard)
@Roles('admin', 'teacher')
async removeUser(@Args('id', { type: () => String }) id: string): Promise<string> {
    await this.usersService.remove(id);
    return `User with id ${id} has been removed`;
}

}