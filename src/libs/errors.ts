import { Response } from "express";
import { ZodError } from "zod";

import { EerrorCodes } from "../types";

// Errors:

// This error is used to indicate that an unknown error has occurred
export class UnknownError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that the content of the file is not a Redable Stream
export class NotIsaRedableError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that the IP of the S3 service cannot be reached (DNS error)
export class S3ServiceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that the s3 service is not running or has an error
export class S3ServiceNotAvailableError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that the song file could not be found
export class FileNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that the song doesn't exist
export class SongNotExistError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that the reference to a database file is not found.
export class FileReferenceNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that an unknown error occurred while working with the file in the database
export class UnknownErrorInFileReferenceError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that the data does not conform to the requested schema
export class ValidationDataError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that 1 or more fields of the request appear 1 or more times
export class DuplicateFieldsError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that a file exceeds the maximum allowed size
export class FileSizeLimitError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that a parameter has not been specified in the request
export class MissingParameterError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// This error is used to indicate that the operation has taken too long to respond
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// Management errors

export function generateDataValidationResponseError(
  res: Response,
  error: ZodError
) {
  return res.status(400).json({
    message: error.issues.map((issue) => issue.message),
    errorCode: EerrorCodes.validationDataError,
  });
}
