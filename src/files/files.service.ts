import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { extname } from 'path';
import { PlansService } from 'src/shared/plans/plans.service';
import { ReportsService } from 'src/shared/reports/reports.service';
import { UsersService } from 'src/shared/users/users.service';
import { v4 as uuid } from 'uuid';
import { UploadFileOptions } from './interfaces/uploadFileOptions.interface';

@Injectable()
export class FilesService {
  constructor(
    private readonly plansService: PlansService,
    private readonly reportsService: ReportsService,
    private readonly usersService: UsersService,
  ) {}

  async uploadPdf(
    file: Express.MulterS3.File,
    username: string,
    type: 'plan' | 'report',
    projectId: number,
  ): Promise<string> {
    switch (type) {
      case 'plan': {
        const plan = await this.plansService.getPlanById(projectId);
        if (!plan) throw new NotFoundException();

        const writerId = plan.projectId.userId;
        const writer = await this.usersService.getUserById(writerId);
        const email = writer?.email;
        if (email !== username) throw new ForbiddenException();

        const uploadedUrl = await this.uploadSingleFile({
          file,
          username,
          fileType: 'pdf',
          folder: 'plan',
          allowedExt: /(pdf)/,
        });

        await this.plansService.updatePdfUrl(projectId, uploadedUrl);

        return;
      }
      case 'report': {
        const report = await this.reportsService.getReportById(projectId);
        if (!report) throw new NotFoundException();

        const writerId = report.projectId.userId;
        const writer = await this.usersService.getUserById(writerId);
        const email = writer?.email;
        if (email !== username) throw new ForbiddenException();

        const uploadedUrl = await this.uploadSingleFile({
          file,
          username,
          fileType: 'pdf',
          folder: 'report',
          allowedExt: /(pdf)/,
        });

        await this.reportsService.updatePdfUrl(projectId, uploadedUrl);

        return;
      }
      default:
        throw new NotFoundException();
    }
  }

  async getPdf(type: 'plan' | 'report', projectId: number, req: any) {
    switch (type) {
      case 'plan': {
        const plan = await this.plansService.getPlanById(projectId);
        if (!plan) throw new NotFoundException();

        const { pdfUrl } = plan;
        const s3Path = '/' + pdfUrl.substring(0, pdfUrl.lastIndexOf('/'));
        const s3Filename = pdfUrl.substring(
          pdfUrl.lastIndexOf('/') + 1,
          pdfUrl.length,
        );

        const filename = `[계획서] ${plan.projectId.projectName} - ${plan.projectId.teamName}.pdf`;

        req.res.set('Content-Type', 'application/octet-stream; charset=utf-8');
        req.res.set(
          'Content-Disposition',
          `attachment; filename="${encodeURI(filename)}"`,
        );
        return this.downloadFromS3(
          s3Filename,
          process.env.AWS_S3_BUCKET + s3Path,
        );
      }
      case 'report': {
        const report = await this.reportsService.getReportById(projectId);
        if (!report) throw new NotFoundException();
        const { pdfUrl } = report;

        const s3Path = '/' + pdfUrl.substring(0, pdfUrl.lastIndexOf('/'));
        const s3Filename = pdfUrl.substring(
          pdfUrl.lastIndexOf('/') + 1,
          pdfUrl.length,
        );

        const filename = `[보고서] ${report.projectId.projectName} - ${report.projectId.teamName}.pdf`;

        req.res.set('Content-Type', 'application/octet-stream; charset=utf-8');
        req.res.set(
          'Content-Disposition',
          `attachment; filename="${encodeURI(filename)}"`,
        );
        return this.downloadFromS3(
          s3Filename,
          process.env.AWS_S3_BUCKET + s3Path,
        );
      }
      default: {
        throw new NotFoundException();
      }
    }
  }

  async uploadImages(files: Express.MulterS3.File[], folder: string) {
    const locations = new Array<string>();
    const extCheck = files.map((file) => {
      const ext = extname(file.originalname).toLowerCase();
      const regex = new RegExp(/(jpg)|(png)|(jpeg)/);
      if (!regex.test(ext)) {
        throw new BadRequestException(
          `This file extension(${ext}) is not supported.`,
        );
      }
    });
    await Promise.all(extCheck);

    const uploadToS3 = files.map((file) => {
      const bucketS3 = process.env.AWS_S3_BUCKET;
      const filename = uuid();
      const ext = extname(file.originalname).toLowerCase();

      locations.push(
        `https://${bucketS3}.s3.${process.env.AWS_REGION}.amazonaws.com/images/${folder}/${filename}
              ${ext}`,
      );
      return this.uploadS3(
        file.buffer,
        `${bucketS3}/images/${folder}`,
        filename + ext,
      );
    });
    try {
      await Promise.all(uploadToS3);
    } catch {
      throw new InternalServerErrorException('An error has occured.');
    }
    return { uploaded: true, urls: locations };
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
    const location = `${options.fileType}/${options.folder}/${options.username}/${filename}${ext}`;
    try {
      await this.uploadS3(
        options.file.buffer,
        `${bucketS3}/${options.fileType}/${options.folder}/${options.username}`,
        filename + ext,
      );
    } catch {
      throw new InternalServerErrorException();
    }
    return location;
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

  async uploadS3(file, bucket, name) {
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

  getS3() {
    return new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
  }
}
