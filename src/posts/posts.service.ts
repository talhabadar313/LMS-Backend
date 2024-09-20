import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { supabase } from '../supabase.config';
import { Batch } from '../batch/entities/batch.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostInput } from './dto/create-post.input';
import { LikesService } from 'src/likes/likes.service';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly likesService: LikesService, // Add this line
  ) {}

  async createPost(createPostInput: CreatePostInput): Promise<Post> {
    const { title, category, createdBy, content, batch_id, user_id, files } =
      createPostInput;
    console.log('Files received:', files);

    // Fetch batch and user
    const batch = await this.batchRepository.findOne({ where: { batch_id } });
    if (!batch) throw new NotFoundException('Batch not found.');

    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user) throw new NotFoundException('User not found.');

    let fileUrls: string[] = [];
    let fileTypes: string[] = [];

    if (files && files.length > 0) {
      console.log('Processing multiple file uploads...');

      for (const filePromise of files) {
        try {
          const resolvedFile = await filePromise;
          const { createReadStream, mimetype, filename } = resolvedFile;

          // Validate file types
          const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
          ];
          if (!allowedMimeTypes.includes(mimetype)) {
            throw new BadRequestException('Invalid file type.');
          }

          // Read file stream
          const stream = createReadStream();
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          // Upload to Supabase
          const { data, error } = await supabase.storage
            .from('LMS Bucket')
            .upload(`posts/${filename}`, buffer, { contentType: mimetype });

          if (error) {
            throw new Error(`File upload error: ${error.message}`);
          }

          // Save file URL
          const fileUrl = data?.path
            ? `${supabase.storage.from('LMS Bucket').getPublicUrl(data.path).data.publicUrl}`
            : null;

          fileUrls.push(fileUrl);
          fileTypes.push(mimetype);

          console.log('File uploaded successfully. URL:', fileUrl);
        } catch (err) {
          console.error('Supabase upload error:', err);
          throw new Error(`File upload error: ${err.message}`);
        }
      }
    }

    // Create and save the new post
    const newPost = this.postRepository.create({
      title,
      category,
      createdBy,
      content,
      fileSrc: fileUrls,
      fileType: fileTypes,
      batch,
      user,
    });

    return this.postRepository.save(newPost);
  }

  async getPostsByBatchId(batchId: string): Promise<any[]> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id: batchId },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found.');
    }

    const posts = await this.postRepository.find({
      where: { batch: batch },
      relations: ['batch', 'user', 'likes', 'likes.user'], // Include likes and user relation
    });

    return posts.map((post) => {
      const userNames = post.likes.map((like) => like.user.name);
      return {
        ...post,
        likeCount: post.likes.length,
        userNames,
      };
    });
  }

  async deletePost(post_id: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { post_id: post_id },
    });
    if (!post) {
      throw new NotFoundException('Post not found.');
    }

    post.deleted = true;
    return this.postRepository.save(post);
  }
}
