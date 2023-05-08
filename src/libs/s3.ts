import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import { v4 as uuid } from "uuid";
import path from "path";

import {
  BUCKET_NAME,
  BUCKET_REGION,
  BUCKET_ACCESS_KEY,
  BUCKET_SECRET_KEY,
  BUCKET_ENDPOINT,
} from "../config";
import {
  IDownloadFileResult,
  IFile,
  IGetFileURLResult,
  IResult,
  IUploadFileResult,
  IUploadFilesResult,
  IUploadedFiles,
} from "../types_and_interfaces";
import { errorCodes, handleS3Error } from "./errorsHandler";

class S3Storage {
  client: S3Client;
  totalUploadedUnsucessfully: number;
  uploadedFiles: IUploadedFiles[];
  totalDeletedUnsucessfully: number;

  constructor() {
    this.client = new S3Client({
      region: BUCKET_REGION,
      credentials: {
        accessKeyId: BUCKET_ACCESS_KEY,
        secretAccessKey: BUCKET_SECRET_KEY,
      },
      endpoint: BUCKET_ENDPOINT,
      forcePathStyle: true,
    });

    this.totalUploadedUnsucessfully = 0;
    this.uploadedFiles = [];
    this.totalDeletedUnsucessfully = 0;
  }

  async uploadFile(file: IFile): Promise<IUploadFileResult> {
    const { size, buffer, originalname } = file;
    const extension = path.extname(originalname);
    const filename = uuid() + extension;

    try {
      const stream = Readable.from(buffer);

      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        ContentLength: size,
        Body: stream,
      };

      const command = new PutObjectCommand(params);
      await this.client.send(command);

      return {
        success: true,
        message: "File successfully uploaded",
        errorCode: errorCodes.none,
        filename,
      };
    } catch (e) {
      //return handleS3Error(e)
      return {
        success: false,
        message: "An unknown error occurred while processing the request",
        errorCode: errorCodes.unknown,
      };
    }
  }

  // todo: Change code to end upload files when one error ocurred
  async uploadFiles(files: IFile[]): Promise<IUploadFilesResult> {
    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadFile(files[i]);

      if (!result.success) {
        this.totalUploadedUnsucessfully++;
      } else {
        this.uploadedFiles.push({
          originalname: files[i].originalname,
          filename: result.filename ?? "",
        });
      }
    }

    if (this.totalUploadedUnsucessfully > 0) {
      return {
        success: false,
        message: `${this.totalUploadedUnsucessfully} file/s have not been uploaded because one or more errors ocurred`,
        errorCode: errorCodes.unknown,
      };
    } else {
      return {
        success: true,
        message: "All files have been successfully uploaded",
        errorCode: errorCodes.none,
        files: this.uploadedFiles,
      };
    }
  }

  // todo: Implement not found errors
  async deleteFile(filename: string): Promise<IResult> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
    };

    try {
      const command = new DeleteObjectCommand(params);
      await this.client.send(command);

      return {
        success: true,
        message: "File successfully deleted",
        errorCode: errorCodes.none,
      };
    } catch (e) {
      console.error(e);
      return {
        success: false,
        message: "An unknow error occurred while deleting the file",
        errorCode: errorCodes.unknown,
      };
    }
  }

  // todo: Implement not found errors, change code to end delete files when one error ocurred
  async deleteFiles(filenames: string[]): Promise<IResult> {
    for (let i = 0; i < filenames.length; i++) {
      const result = await this.deleteFile(filenames[i]);

      if (!result.success) {
        this.totalDeletedUnsucessfully++;
      }
    }

    if (this.totalDeletedUnsucessfully > 0) {
      return {
        success: false,
        message: `${this.totalDeletedUnsucessfully} file/s have not been deleted because one or more errors ocurred`,
        errorCode: errorCodes.unknown,
      };
    } else {
      return {
        success: true,
        message: "All files have been deleted successfully",
        errorCode: errorCodes.none,
      };
    }
  }

  // todo: Implement not found errors
  async downloadFile(filename: string): Promise<IDownloadFileResult> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
    };

    const command = new GetObjectCommand(params);

    try {
      const { ContentLength, Body } = await this.client.send(command);

      if (Body instanceof Readable) {
        return {
          success: true,
          message: "File successfully recovered",
          errorCode: errorCodes.none,
          size: ContentLength,
          data: Body,
        };
      }

      return {
        success: false,
        message: "The file does not appear to be a Redable",
        errorCode: errorCodes.notIsaRedable,
      };
    } catch (e) {
      console.error(e);
      return {
        success: false,
        message: "An unknow error occurred while downloading the file",
        errorCode: errorCodes.unknown,
      };
    }
  }

  // todo: implement not found errors
  async getFileURL(
    filename: string,
    expiresIn: number
  ): Promise<IGetFileURLResult> {
    const params = {
      Bucket: BUCKET_NAME,
      Key: filename,
    };

    const command = new GetObjectCommand(params);

    try {
      const url = await getSignedUrl(this.client, command, { expiresIn });
      return {
        success: true,
        message: "URL of the file generated succesfully",
        errorCode: errorCodes.none,
        url,
      };
    } catch (e) {
      console.error(e);
      return {
        success: false,
        message:
          "An unknown error occurred while trying to get the url of the file",
        errorCode: errorCodes.unknown,
      };
    }
  }
}

export default S3Storage;