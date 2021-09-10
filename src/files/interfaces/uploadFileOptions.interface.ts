export interface UploadFileOptions {
  file: Express.MulterS3.File;
  username: string;
  fileType: 'pdf' | 'video';
  folder: string;
  allowedExt: RegExp;
}
