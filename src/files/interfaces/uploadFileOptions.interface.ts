export interface UploadFileOptions {
  file?: Express.MulterS3.File;
  files?: Express.MulterS3.File[];
  fileType: 'pdf' | 'video' | 'images';
  folder: string;
  projectId: number;
  allowedExt: RegExp;
}
