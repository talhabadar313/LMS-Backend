// src/types/file-upload.ts
import { Readable } from 'stream';

export type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => Readable;
};
