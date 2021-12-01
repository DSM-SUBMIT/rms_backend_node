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
import { HeadObjectOutput } from 'aws-sdk/clients/s3';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { UploadFileOptions } from './interfaces/uploadFileOptions.interface';
import { ProjectRepository } from 'src/shared/entities/project/project.repository';

@Injectable()
export class FilesService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async uploadImages(
    files: Express.MulterS3.File[],
    username: string,
    projectId: number,
  ): Promise<string[]> {
    const project = await this.projectRepository.findOne(
      { id: projectId },
      { writer: true },
    );
    if (!project) throw new NotFoundException();

    const writer = project.writer;
    const email = writer.email;
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
    const project = await this.projectRepository.findOne(
      { id: projectId },
      { writer: true },
    );
    if (!project) throw new NotFoundException();

    const writer = project.writer;
    const email = writer.email;
    if (email !== username) throw new ForbiddenException();

    const s3Path = `${projectId}/report/images`;
    if (
      !(await this.isExist(filename, `${process.env.AWS_S3_BUCKET}/${s3Path}`))
    )
      throw new NotFoundException();

    await this.deleteFromS3(filename, `${process.env.AWS_S3_BUCKET}/${s3Path}`);
  }

  async getImage(
    req,
    projectId: number,
    filename: string,
  ): Promise<StreamableFile> {
    const project = await this.projectRepository.findOne({ id: projectId }, {});
    if (!project) throw new NotFoundException();

    const s3Path = `${projectId}/report/images`;
    if (
      !(await this.isExist(filename, `${process.env.AWS_S3_BUCKET}/${s3Path}`))
    )
      throw new NotFoundException();

    const ext = extname(filename).slice(1);
    req.res.set({
      'Content-Type': `image/${ext}; charset=utf-8`,
    });

    return await this.downloadFromS3(
      filename,
      `${process.env.AWS_S3_BUCKET}/${projectId}/report/images`,
    );
  }

  async uploadArchive(
    file: Express.MulterS3.File,
    username: string,
    projectId: number,
  ) {
    const project = await this.projectRepository.findOne(
      { id: projectId },
      { writer: true },
    );
    if (!project) throw new NotFoundException();

    const writer = project.writer;
    const email = writer.email;
    if (email !== username) throw new ForbiddenException();

    if (
      await this.isExist(
        'archive_outcomes.zip',
        `${process.env.AWS_S3_BUCKET}/${projectId}/report/archive`,
      )
    )
      throw new ConflictException();

    await this.uploadSingleFile({
      file,
      fileName: 'archive_outcomes',
      folder: 'report',
      fileType: 'archive',
      projectId,
      allowedExt: /(zip)/,
    });

    return;
  }

  async deleteArchive(username: string, projectId: number) {
    const project = await this.projectRepository.findOne(
      { id: projectId },
      { writer: true },
    );
    if (!project) throw new NotFoundException();

    const writer = project.writer;
    const email = writer.email;
    if (email !== username) throw new ForbiddenException();

    if (
      await this.isExist(
        'archive_outcomes.zip',
        `${process.env.AWS_S3_BUCKET}/${projectId}/report/archive`,
      )
    )
      throw new ConflictException();

    await this.deleteFromS3(
      'archive_outcomes.zip',
      `${process.env.AWS_S3_BUCKET}/${projectId}/report/archive`,
    );

    return;
  }

  async getArchive(req, projectId) {
    const project = await this.projectRepository.findOne(
      { id: projectId },
      { status: true },
    );
    if (!project) throw new NotFoundException();
    if (!project.status.isReportSubmitted) throw new NotFoundException();

    const s3Path = `${projectId}/report/archive`;
    const s3Filename = 'archive_outcomes.zip';

    const fileInfo = await this.isExist(
      s3Filename,
      `${process.env.AWS_S3_BUCKET}/${s3Path}`,
    );

    if (!fileInfo) throw new NotFoundException();

    const filename = `[${project.projectType}] ${project.projectName} - ${
      project.teamName
    }${extname(s3Filename)}`;
    req.res.set({
      'Content-Type': 'application/octet-stream; charset=utf-8',
      'Content-Disposition': `'attachment; filename="${encodeURI(filename)}"`,
      'Content-Length': fileInfo.ContentLength,
    });

    return await this.downloadFromS3(
      s3Filename,
      `${process.env.AWS_S3_BUCKET}/${s3Path}`,
    );
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
    const filename = options.fileName ?? uuid();
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

  async isExist(filename: string, bucket: string): Promise<HeadObjectOutput> {
    const s3 = this.getS3();
    try {
      return await s3.headObject({ Bucket: bucket, Key: filename }).promise();
    } catch (e) {
      if (e.code === 'NotFound') return null;
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
