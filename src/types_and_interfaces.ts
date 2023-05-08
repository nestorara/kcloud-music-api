import { Document } from "mongoose";
import { Readable } from "stream";

export interface IResult {
  success: boolean;
  message: string;
  errorCode: number
}

export interface IRequestFiles {
  [fieldname: string]: Express.Multer.File[];
}

export interface IFile {
  size: number;
  buffer: Buffer;
  originalname: string;
}

export interface ISong extends Document {
  name: string;
  genre?: string[];
  artists?: string[];
  album?: string[];
  songFile: string;
  cover?: string;
  accountId: string;
}

export interface IUploadedFiles {
  originalname: string;
  filename: string;
}

export interface IUploadFileResult extends IResult {
  filename?: string;
}

export interface IUploadFilesResult extends IResult {
  files?: IUploadedFiles[];
}

export interface IDownloadFileResult extends IResult {
  size?: number;
  data?: Readable;
}

export interface IGetFileURLResult extends IResult {
  url?: string
}