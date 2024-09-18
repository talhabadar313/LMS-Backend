import { Module } from '@nestjs/common';
import { PostService } from './posts.service';
import { PostResolver } from './posts.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { BatchModule } from '../batch/batch.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    BatchModule,
    UsersModule,
    AuthModule,
  ],
  providers: [PostResolver, PostService],
})
export class PostsModule {}
