import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
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
import { IFile, IRequestFile } from "../types";
import { FileNotFoundError, NotIsaRedableError } from "./errors";
import { timeout } from "../utils";
import { s3ErrorHandler } from "./s3ErrorHandler";

class S3Storage {
  client: S3Client;
  timeout: number;

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

    this.timeout = 30;
  }

  async uploadFile(file: IRequestFile): Promise<string> {
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

      timeout(300, this.client.send(command));

      return filename;
    } catch (error: any) {
      throw s3ErrorHandler(error, "Error uploading file");
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const fileExist = await this.fileExist(filename);

      if (!fileExist) {
        throw new FileNotFoundError(
          "An error occurred while deleting the file: file does not exist"
        );
      }

      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
      };

      const command = new DeleteObjectCommand(params);
      timeout(this.timeout, this.client.send(command));
    } catch (error: any) {
      s3ErrorHandler(error, "Error deleting file");
    }
  }

  async downloadFile(filename: string): Promise<IFile> {
    try {
      const fileExist = await this.fileExist(filename);

      if (!fileExist) {
        throw new FileNotFoundError(
          "Error downloading file: file does not exist"
        );
      }

      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
      };

      const command = new GetObjectCommand(params);
      const file = await timeout(this.timeout, this.client.send(command));

      if (file.Body instanceof Readable) {
        return {
          fileSize: file.ContentLength!,
          fileData: file.Body,
        };
      } else {
        throw new NotIsaRedableError(
          "The file does not appear to be a Redable"
        );
      }
    } catch (error: any) {
      throw s3ErrorHandler(error, "Error downloading file");
    }
  }

  async getFileURL(
    filename: string,
    expiresIn: number = 60 * 4 // 4 minutes
  ): Promise<string> {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
      };

      const fileExist = await this.fileExist(filename);

      if (!fileExist) {
        throw new FileNotFoundError(
          "Error generating file url: file does not exist"
        );
      }

      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(this.client, command, { expiresIn });

      return url;
    } catch (error: any) {
      throw s3ErrorHandler(error, "Error generating file url");
    }
  }

  async fileExist(filename: string): Promise<boolean> {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
      };

      const command = new HeadObjectCommand(params);
      timeout(12, this.client.send(command));

      return true;
    } catch (error: any) {
      if (error.name === "NotFound") {
        return false;
      } else {
        throw s3ErrorHandler(error, "Error checking if file exists");
      }
    }
  }
}

export default S3Storage;
