import { forwardRef, Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesResolver } from './likes.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like]),
    forwardRef(() => PostsModule),
    UsersModule,
  ],
  providers: [LikesResolver, LikesService],
  exports: [LikesService],
})
export class LikesModule {}
