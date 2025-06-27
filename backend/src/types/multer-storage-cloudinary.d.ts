declare module 'multer-storage-cloudinary' {
  import { StorageEngine } from 'multer';
  import { v2 as cloudinary } from 'cloudinary';

  interface CloudinaryStorageParams {
    folder?: string;
    allowed_formats?: string[];
    transformation?: any[];
    public_id?: (req: any, file: any) => string;
    format?: string;
    [key: string]: any;
  }

  interface CloudinaryStorageOptions {
    cloudinary: typeof cloudinary;
    params: CloudinaryStorageParams | ((req: any, file: any) => CloudinaryStorageParams);
  }

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: CloudinaryStorageOptions);
    _handleFile(req: any, file: any, cb: any): void;
    _removeFile(req: any, file: any, cb: any): void;
  }
}