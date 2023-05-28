import {
  FileNotFoundError,
  S3ServiceNotAvailableError,
  S3ServiceNotFoundError,
  TimeoutError,
  UnknownError,
} from "./errors";

export function s3ErrorHandler(error: any, operation: string) {
  if (error instanceof TimeoutError) {
    throw new TimeoutError(`${operation}: server took too long to respond`);
  } else if (
    error.code === "ENOTFOUND" ||
    error instanceof S3ServiceNotFoundError
  ) {
    throw new S3ServiceNotFoundError(`${operation}: storage service not found`);
  } else if (
    error.code === "ECONNREFUSED" ||
    error instanceof S3ServiceNotAvailableError
  ) {
    throw new S3ServiceNotAvailableError(
      `${operation} file: storage service not available`
    );
  } else {
    throw new UnknownError(`${operation}: unknow error`);
  }
}

export default s3ErrorHandler;
