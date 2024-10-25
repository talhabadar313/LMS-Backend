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
import { LikesService } from '../likes/likes.service';
import { UpdatePostInput } from './dto/update-post.input';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly likesService: LikesService,
  ) {}

  async createPost(createPostInput: CreatePostInput): Promise<Post> {
    const { title, category, createdBy, content, batch_id, files } =
      createPostInput;
    console.log('Files received:', files);

    const batch = await this.batchRepository.findOne({ where: { batch_id } });
    if (!batch) throw new NotFoundException('Batch not found.');

    let fileUrls: string[] = [];
    let fileTypes: string[] = [];

    if (files && files.length > 0) {
      console.log('Processing multiple file uploads...');

      for (const filePromise of files) {
        try {
          const resolvedFile = await filePromise;
          const { createReadStream, mimetype, filename } = resolvedFile;

          const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
          ];
          if (!allowedMimeTypes.includes(mimetype)) {
            throw new BadRequestException('Invalid file type.');
          }

          const stream = createReadStream();
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          const { data, error } = await supabase.storage
            .from('LMS Bucket')
            .upload(`posts/${filename}`, buffer, { contentType: mimetype });

          if (error) {
            throw new Error(`File upload error: ${error.message}`);
          }

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

    const userData = await this.userRepository.findOneBy({
      user_id: createdBy,
    });
    if (!userData) {
      throw new BadRequestException('User not found');
    }

    const newPost = this.postRepository.create({
      title,
      category,
      createdBy: userData,
      content,
      fileSrc: fileUrls,
      fileType: fileTypes,
      batch,
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
      relations: [
        'batch',
        'likes',
        'likes.user',
        'createdBy',
        'comments',
        'comments.replies',
      ],
    });

    return posts.map((post) => {
      const userNames = post.likes.map((like) => like.user.name);

      const comments = post.comments.map((comment) => ({
        ...comment,
        replies: comment.replies ? comment.replies : [],
      }));

      return {
        ...post,
        likeCount: post.likes.length,
        userNames,
        comments,
      };
    });
  }

  async getPostsByBatchIdForStudentSide(batchId: string): Promise<any[]> {
    const batch = await this.batchRepository.findOne({
      where: { batch_id: batchId },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found.');
    }

    const posts = await this.postRepository.find({
      where: { batch: batch, deleted: false },

      relations: [
        'batch',
        'likes',
        'likes.user',
        'createdBy',
        'comments',
        'comments.replies',
      ],
    });

    return posts.map((post) => {
      const userNames = post.likes.map((like) => like.user.name);

      const comments = post.comments.map((comment) => ({
        ...comment,
        replies: comment.replies ? comment.replies : [],
      }));

      return {
        ...post,
        likeCount: post.likes.length,
        userNames,
        comments,
      };
    });
  }

  async updatePost(updatePostInput: UpdatePostInput): Promise<Post> {
    const { post_id, title, content, files } = updatePostInput;

    const post = await this.postRepository.findOne({
      where: { post_id },
      relations: ['batch'],
    });
    if (!post) throw new NotFoundException('Post not found.');

    const existingFileUrls = post.fileSrc || [];
    const existingFileTypes = post.fileType || [];

    let newFileUrls: string[] = [];
    let newFileTypes: string[] = [];

    if (files && files.length > 0) {
      for (const filePromise of files) {
        const resolvedFile = await filePromise;
        const { filename, mimetype } = resolvedFile;

        const existingFileUrl = existingFileUrls.find((url) =>
          url.endsWith(filename),
        );

        if (!existingFileUrl) {
          // Get the names of users who liked the post
          const { createReadStream } = resolvedFile;
          const stream = createReadStream();
          // Get the comments and their replies
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);
          // Return the post with the like count, userNames and comments

          const { data, error } = await supabase.storage
            .from('LMS Bucket')
            .upload(`posts/${filename}`, buffer, { contentType: mimetype });

          if (error) {
            console.error(`File upload error: ${error.message}`);
            continue;
          }

          const fileUrl = data?.path
            ? supabase.storage.from('LMS Bucket').getPublicUrl(data.path).data
                .publicUrl
            : null;

          if (fileUrl) {
            newFileUrls.push(fileUrl);
            newFileTypes.push(mimetype);
          }
        } else {
          newFileUrls.push(existingFileUrl);
          const existingFileType =
            existingFileTypes[existingFileUrls.indexOf(existingFileUrl)];
          newFileTypes.push(existingFileType || mimetype);
          console.log(`Retained existing file: ${existingFileUrl}`);
        }
      }
    }
    const filesToRemove = existingFileUrls.filter(
      (url) => !newFileUrls.includes(url),
    );
    for (const fileUrl of filesToRemove) {
      const fileName = fileUrl.split('/').pop();
      const { error: deleteError } = await supabase.storage
        .from('LMS Bucket')
        .remove([`posts/${fileName}`]);

      if (deleteError) {
        console.error(
          `Error removing file from Supabase: ${deleteError.message}`,
        );
      }
    }
    post.title = title || post.title;
    post.content = content || post.content;
    post.fileSrc = [...newFileUrls];
    post.fileType = [...newFileTypes];

    return this.postRepository.save(post);
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
