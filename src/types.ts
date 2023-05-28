import { Document } from "mongoose";
import { Readable } from "stream";

export enum EerrorCodes {
  // If all goes well
  none = "NONE",
  unknown = "UNKNOWN",
  notIsaRedable = "NOTISAREDABLE",
  S3ServiceNotFound = "S3SERVICENOTFOUND",
  S3ServiceNotAvailable = "S3SERVICENOTAVAILABLE",
  fileNotFound = "FILENOTFOUND",
  songNotExist = "SONGNOTEXIST",
  fileReferenceNotFound = "FILEREFERENCENOTFOUND",
  unknownErrorInFileReference = "UNKNOWNERRORINFILEREFERENCE",
  validationDataError = "VALIDATIONDATAERROR",
  duplicateFields = "DUPLICATEFIELDS",
  fileSizeLimit = "FILESIZELIMIT",
  missingParameter = "MISSINGPARAMETER",
  timeout = "TIMEOUT",
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

export interface ISong extends Document {
  name: string;
  genre?: string[];
  artists?: string[];
  album?: string[];
  songFile: string;
  cover?: string;
  accountId: string;
}

export interface IFile {
  fileSize: number;
  fileData: Readable;
}

export enum ESongFiles {
  songFile = "songFile",
  cover = "cover",
}
