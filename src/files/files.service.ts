import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  StreamableFile,
} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { extname } from 'path';
import { ProjectsService } from 'src/projects/projects.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { UsersService } from 'src/shared/users/users.service';
import { v4 as uuid } from 'uuid';
import { UploadFileOptions } from './interfaces/uploadFileOptions.interface';

@Injectable()
export class FilesService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly reportsService: ReportsService,
    private readonly usersService: UsersService,
  ) {}

  async uploadVideo(
    file: Express.MulterS3.File,
    username: string,
    projectId: number,
  ) {
    const report = await this.reportsService.getReportById(projectId);
    if (!report) throw new NotFoundException();
    if (report.videoUrl) throw new ConflictException();

    const writerId = report.projectId.writerId;
    const writer = await this.usersService.getUserById(writerId.id);
    const email = writer?.email;
    if (email !== username) throw new ForbiddenException();

    const uploadedUrl = await this.uploadSingleFile({
      file,
      folder: 'report',
      fileType: 'video',
      projectId,
      allowedExt: /(mp4)|(mov)|(wmv)|(avi)|(mkv)/,
    });

    await this.reportsService.updateVideoUrl(projectId, uploadedUrl);

    return;
  }

  async deleteVideo(username: string, projectId: number) {
    const report = await this.reportsService.getReportById(projectId);
    if (!report) throw new NotFoundException();
    if (!report.videoUrl) throw new NotFoundException();

    const writerId = report.projectId.writerId;
    const writer = await this.usersService.getUserById(writerId.id);
    const email = writer?.email;
    if (email !== username) throw new ForbiddenException();

    const { videoUrl } = report;

    const s3Path = videoUrl.substring(0, videoUrl.lastIndexOf('/'));
    const s3Filename = videoUrl.substring(
      videoUrl.lastIndexOf('/') + 1,
      videoUrl.length,
    );

    await this.deleteFromS3(
      s3Filename,
      `${process.env.AWS_S3_BUCKET}/${s3Path}`,
    );

    await this.reportsService.updateVideoUrl(projectId, null);
  }

  async getVideo(req, projectId) {
    const report = await this.reportsService.getReportById(projectId);
    if (!report) throw new NotFoundException();
    if (!report.videoUrl) throw new NotFoundException();

    const { videoUrl } = report;

    const s3Path = videoUrl.substring(0, videoUrl.lastIndexOf('/'));
    const s3Filename = videoUrl.substring(
      videoUrl.lastIndexOf('/') + 1,
      videoUrl.length,
    );

    const filename = `[${report.projectId.projectType}] ${
      report.projectId.projectName
    } - ${report.projectId.teamName}${extname(s3Filename)}`;
    req.res.set({
      'Content-Type': 'application/octet-stream; charset=utf-8',
      'Content-Disposition': `'attachment; filename="${encodeURI(filename)}"`,
    });

    return await this.downloadFromS3(
      s3Filename,
      `${process.env.AWS_S3_BUCKET}/${s3Path}`,
    );
  }

  async uploadImages(
    files: Express.MulterS3.File[],
    username: string,
    projectId: number,
  ): Promise<string[]> {
    const report = await this.reportsService.getReportById(projectId);
    if (!report) throw new NotFoundException();

    const writerId = report.projectId.writerId;
    const writer = await this.usersService.getUserById(writerId.id);
    const email = writer?.email;
    if (email !== username) throw new ForbiddenException();

    const uploadedUrls = await this.uploadMultipleFiles({
      files,
      folder: 'report',
      fileType: 'images',
      projectId,
      allowedExt: /(jpg)|(png)|(jpeg)|(bmp)/,
    });
    return uploadedUrls.map((url) => {
      return `https://files-api.dsm-rms.com/files/${url}`;
    });
  }

  async deleteImage(
    username: string,
    projectId: number,
    filename: string,
  ): Promise<void> {
    const project = await this.projectsService.getProject(projectId);
    if (!project) throw new NotFoundException();

    const writer = project.writerId;
    const email = writer?.email;
    if (email !== username) throw new ForbiddenException();

    const s3Path = `${projectId}/report/images`;
    if (
      !(await this.isExist(filename, `${process.env.AWS_S3_BUCKET}/${s3Path}`))
    )
      throw new NotFoundException();

    await this.deleteFromS3(filename, `${process.env.AWS_S3_BUCKET}/${s3Path}`);
  }

  async uploadSingleFile(options: UploadFileOptions): Promise<string> {
    const ext = extname(options.file.originalname).toLowerCase();
    const regex = options.allowedExt;
    if (!regex.test(ext)) {
      throw new BadRequestException(
        `This file extension(${ext}) is not supported.`,
      );
    }

    const bucketS3 = process.env.AWS_S3_BUCKET;
    const filename = uuid();
    const location = `${options.projectId}/${options.folder}/${options.fileType}/${filename}${ext}`;
    try {
      await this.uploadToS3(
        options.file.buffer,
        `${bucketS3}/${options.projectId}/${options.folder}/${options.fileType}`,
        filename + ext,
      );
    } catch {
      throw new InternalServerErrorException();
    }
    return location;
  }

  async uploadMultipleFiles(options: UploadFileOptions): Promise<string[]> {
    const locations = new Array<string>();
    const extCheck = options.files.map((file) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!options.allowedExt.test(ext)) {
        throw new BadRequestException(
          `This file extension(${ext}) is not supported.`,
        );
      }
    });
    await Promise.all(extCheck);

    const uploadToS3 = options.files.map((file) => {
      const bucketS3 = process.env.AWS_S3_BUCKET;
      const filename = uuid();
      const ext = extname(file.originalname).toLowerCase();

      locations.push(
        `${options.projectId}/${options.folder}/${options.fileType}/${filename}${ext}`,
      );
      return this.uploadToS3(
        file.buffer,
        `${bucketS3}/${options.projectId}/${options.folder}/${options.fileType}`,
        filename + ext,
      );
    });
    try {
      await Promise.all(uploadToS3);
    } catch {
      throw new InternalServerErrorException('An error has occured.');
    }
    return locations;
  }

  async isExist(filename: string, bucket: string): Promise<boolean> {
    const s3 = this.getS3();
    try {
      await s3.headObject({ Bucket: bucket, Key: filename }).promise();
      return true;
    } catch (e) {
      if (e.code === 'NotFound') return false;
      else throw new ServiceUnavailableException();
    }
  }

  async downloadFromS3(
    filename: string,
    bucket: string,
  ): Promise<StreamableFile> {
    const s3 = this.getS3();
    return new Promise((resolve, reject) => {
      try {
        const stream = s3
          .getObject({ Bucket: bucket, Key: filename })
          .createReadStream();
        resolve(new StreamableFile(stream));
      } catch (e) {
        reject(e);
      }
    });
  }

  async uploadToS3(file, bucket, name) {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
    };

    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  async deleteFromS3(filename: string, bucket: string) {
    const s3 = this.getS3();
    return new Promise((resolve, reject) => {
      s3.deleteObject({ Bucket: bucket, Key: filename }, (err, data) => {
        if (err) {
          Logger.error(err);
          return reject(err.message);
        }
        resolve(data);
      });
    });
  }

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }
}
