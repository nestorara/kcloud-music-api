import { Document } from "mongoose";
import { Readable } from "stream";

export enum EerrorCodes {
  UnknownError = "UNKNOWNERROR",
  NotIsRedableError = "NOTISREDABLEERROR",
  S3ServiceNotAvailableError = "S3SERVICENOTAVAILABLEERROR",
  FileNotFoundError = "FILENOTFOUNDERROR",
  SongNotFoundError = "SONGNOTFOUNDERROR",
  ValidationDataError = "VALIDATIONDATAERROR",
  DuplicateFieldsError = "DUPLICATEFIELDSERROR",
  FileSizeLimitError = "FILESIZELIMITERROR",
  MissingParameterError = "MISSINGPARAMETERERROR",
  TimeoutError = "TIMEOUTERROR",
  ResourceNotFoundError = "RESOURCENOTFOUNDERROR",
  DBConnectionError = "DBCONNECTIONERROR",
  DBConnectionInProgressError = "DBCONNECTIONINPROGRESSERROR",
  // Error when a route does not exist, equivalent to 404 error
  PathNotFound = "PATHNOTFOUND",
  UnsupportedFileTypeError = "UNSUPPORTEDFILETYPEERROR",
  // When the resource has no assigned value or it is empty
  EmptyResourceError = "EMPTYRESOURCEERROR",
  DisabledFunctionalitieError = "DISABLEDFUNCTIONALITIEERROR",
  S3AccessDeniedError = "S3ACCESSDENIEDERROR",
}

export interface IRequestFiles {
  [fieldname: string]: Express.Multer.File[];
}

export interface IRequestFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ISong_File {
  fileName: string;
  size: number;
  mimetype: string;
}

export interface ISong extends Document {
  name: string;
  genre?: string[];
  artists?: string[];
  album?: string[];
  songFile: ISong_File;
  cover?: ISong_File;
  accountId: string;
}

export interface IFile {
  fileSize: number;
  fileData: Readable;
}

export interface IResponseError {
  message: string | string[];
  resource?: string;
  errorCode: EerrorCodes;
}

export interface IResponseClientError {
  status: number;
  error: IResponseError;
}

export const supportedAudioMimetypes = [
  "audio/wave",
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
];

export const supportedImageMimetypes = [
  "image/gif",
  "image/jpeg",
  "image/svg+xml",
  "image/webp",
  "image/png",
];

export const requiredENV = [
  "BUCKET_NAME",
  "BUCKET_SECRET_KEY",
  "BUCKET_ACCESS_KEY",
  "BUCKET_REGION",
  "BUCKET_ENDPOINT",
  "DB_HOST",
];
