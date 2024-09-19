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

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Batch)
    private readonly batchRepository: Repository<Batch>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPost(createPostInput: CreatePostInput): Promise<Post> {
    const { category, createdBy, content, batch_id, user_id, file } =
      createPostInput;

    // Validate batch_id
    const batch = await this.batchRepository.findOne({
      where: { batch_id },
    });
    if (!batch) {
      throw new NotFoundException('Batch not found.');
    }

    // Validate user_id
    const user = await this.userRepository.findOne({
      where: { user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Handle file upload
    let fileUrl = null;
    let fileType = null;
    if (file) {
      const resolvedFile = await file;
      const { createReadStream, mimetype, filename } = resolvedFile;

      // Allowed MIME types
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

      if (!allowedMimeTypes.includes(mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only JPEG, PNG, and PDF files are allowed.',
        );
      }

      try {
        // Convert the stream to a buffer
        const stream = createReadStream();
        const chunks = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Determine file type based on MIME type
        if (mimetype === 'image/jpeg') {
          fileType = 'image/jpeg';
        } else if (mimetype === 'image/png') {
          fileType = 'image/png';
        } else if (mimetype === 'application/pdf') {
          fileType = 'application/pdf';
        }

        // Upload the buffer to Supabase
        const { data, error } = await supabase.storage
          .from('LMS Bucket')
          .upload(`posts/${filename}`, buffer, {
            contentType: mimetype,
          });

        if (error) {
          throw new Error(`File upload error: ${error.message}`);
        }

        // Generate the public URL for the file
        fileUrl = data?.path
          ? `${supabase.storage.from('LMS Bucket').getPublicUrl(data.path).data.publicUrl}`
          : null;
      } catch (err) {
        console.error('Supabase upload error:', err);
        throw new Error(`File upload error: ${err.message}`);
      }
    }

    // Create and save the new post
    const newPost = this.postRepository.create({
      category,
      createdBy,
      content,
      fileSrc: fileUrl,
      fileType: fileType, // Save the fileType
      batch,
      user,
    });

    return this.postRepository.save(newPost);
  }
}
