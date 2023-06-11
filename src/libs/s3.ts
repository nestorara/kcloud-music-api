import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  HeadBucketCommand,
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
import {
  NotIsRedableError,
  S3ServiceNotAvailableError,
  TimeoutError,
  s3ErrorHandler,
} from "./errors";

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

    this.timeout = 300 * 1000; // 5 min
  }

  async uploadFile(
    file: IRequestFile,
    resourceName?: string,
    action: string = "uploadFile"
  ): Promise<string> {
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

      await this.executeS3Command(this.timeout, command, resourceName, action);

      return filename;
    } catch (error) {
      throw s3ErrorHandler(error, "Error uploading file", resourceName, action);
    }
  }

  async deleteFile(
    filename: string,
    resourceName?: string,
    action: string = "deleteFile"
  ): Promise<void> {
    try {
      await this.checkfileExist(filename, resourceName, action);

      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
      };

      const command = new DeleteObjectCommand(params);
      await this.executeS3Command(
        30 * 1000 /* 30 segundos */,
        command,
        resourceName,
        action
      );
    } catch (error) {
      s3ErrorHandler(error, "Error deleting file", resourceName, action);
    }
  }

  async downloadFile(
    filename: string,
    resourceName?: string,
    action: string = "downloadFile"
  ): Promise<IFile> {
    try {
      await this.checkfileExist(filename, resourceName, action);

      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
      };

      const command = new GetObjectCommand(params);
      const file = await this.executeS3Command(
        this.timeout,
        command,
        resourceName,
        action
      );

      if (file.Body instanceof Readable) {
        return {
          fileSize: file.ContentLength!,
          fileData: file.Body,
        };
      } else {
        throw new NotIsRedableError(
          "The file doesn't appear to be a Redable",
          resourceName,
          action
        );
      }
    } catch (error) {
      throw s3ErrorHandler(
        error,
        "Error downloading file",
        resourceName,
        action
      );
    }
  }

  async getFileURL(
    filename: string,
    expiresIn: number = 60 * 4 /* 4 min */,
    resourceName?: string,
    action: string = "getFileURL"
  ): Promise<string> {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
      };

      await this.checkfileExist(filename, resourceName, action);

      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(this.client, command, { expiresIn });

      return url;
    } catch (error) {
      throw s3ErrorHandler(
        error,
        "Error generating file url",
        resourceName,
        action
      );
    }
  }

  async checkfileExist(
    filename: string,
    resourceName?: string,
    action: string = "checkfileExist"
  ): Promise<boolean> {
    try {
      const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
      };

      const command = new HeadObjectCommand(params);
      await this.executeS3Command(
        12 * 1000 /* 12 sec */,
        command,
        resourceName,
        action
      );

      return true;
    } catch (error) {
      throw s3ErrorHandler(
        error,
        "Error checking if file exists",
        resourceName,
        action
      );
    }
  }

  async CheckServiceStatus(): Promise<boolean> {
    try {
      const params = {
        Bucket: BUCKET_NAME,
      };

      const storage = new S3Storage();

      const command = new HeadBucketCommand(params);

      await storage.client.send(command);

      // if service is availble return true
      return true;
    } catch {
      throw new S3ServiceNotAvailableError("storage service not available");
    }
  }

  async executeS3Command(
    time: number,
    command: any,
    resourceName?: string,
    action: string = "executeS3Command"
  ): Promise<any> {
    try {
      const result = await Promise.race([
        this.client.send(command),
        new Promise<void>((_, reject) => {
          setTimeout(
            () =>
              reject(
                new TimeoutError(
                  "Error executing s3 command: storage service takes too long to respond",
                  resourceName,
                  action
                )
              ),
            time
          );
        }),
      ]);

      return result;
    } catch (error) {
      throw error;
    }
  }
}

export default S3Storage;
