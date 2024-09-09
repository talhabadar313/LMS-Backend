import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';



@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => User)
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'userByEmail' })
  @UseGuards(AuthGuard)
  
  findOneByEmail(@Args('email', { type: () => String }) email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Query(() => User, { name: 'user' })
  @UseGuards(AuthGuard)
  
  findOne(@Args('id', { type: () => String }) user_id: string) {
    return this.usersService.findOne(user_id);
  }

  @Query(() => [User], { name: 'teachers' })
  @UseGuards(AuthGuard)
  
  findTeachers() {
   return this.usersService.findTeachers()
  }
  @Mutation(() => User)
  @UseGuards(AuthGuard)
  
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput.user_id, updateUserInput);
  }

  @Mutation(() => String)
@UseGuards(AuthGuard)
async removeUser(@Args('id', { type: () => String }) id: string): Promise<string> {
    await this.usersService.remove(id);
    return `User with id ${id} has been removed`;
}

}