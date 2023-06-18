import { ZodError } from "zod";

import { EerrorCodes, IResponseClientError, IResponseError } from "../types";

// Errors:

class BaseError extends Error {
  code: EerrorCodes;
  resourceName?: string;
  action?: string;

  constructor(
    message: string,
    code: EerrorCodes,
    resourceName?: string,
    action?: string
  ) {
    super(message);
    this.code = code;
    this.resourceName = resourceName;
    this.action = action;
  }
}

// This error is used to indicate that an unknown error has occurred
export class UnknownError extends BaseError {
  constructor(message: string, resourceName?: string, action?: string) {
    super(message, EerrorCodes.UnknownError, resourceName, action);
  }
}

// This error is used to indicate that the contents of the file is corrupted, unreadable or invalid
export class NotIsRedableError extends BaseError {
  constructor(message: string, resourceName?: string, action?: string) {
    super(message, EerrorCodes.NotIsRedableError, resourceName, action);
  }
}

// This error is used to indicate that the s3 service is not running or has an error
export class S3ServiceNotAvailableError extends BaseError {
  constructor(message: string, resourceName?: string, action?: string) {
    super(
      message,
      EerrorCodes.S3ServiceNotAvailableError,
      resourceName,
      action
    );
  }
}

// This error is used to indicate that the song file could not be found
export class FileNotFoundError extends BaseError {
  constructor(message: string, resourceName?: string, action?: string) {
    super(message, EerrorCodes.FileNotFoundError, resourceName, action);
  }
}

// This error is used to indicate that the resource doesn't found
export class ResourceNotFoundError extends BaseError {
  constructor(message: string, resourceName?: string, action?: string) {
    super(message, EerrorCodes.ResourceNotFoundError, resourceName, action);
  }
}

// This error is used to indicate that the operation has taken too long to respond
export class TimeoutError extends BaseError {
  constructor(message: string, resourceName?: string, action?: string) {
    super(message, EerrorCodes.TimeoutError, resourceName, action);
  }
}

// This error is used to indicate that database is not ready
export class DBConnectionError extends BaseError {
  constructor(message: string, resourceName?: string, action?: string) {
    super(message, EerrorCodes.DBConnectionError, resourceName, action);
  }
}

export class UnsupportedFileTypeError extends BaseError {
  constructor(message: string, resourceName?: string, action?: string) {
    super(message, EerrorCodes.UnsupportedFileTypeError, resourceName, action);
  }
}

export class S3AccessDeniedError extends BaseError {
  constructor(message: string, resourceName?: string, action?: string) {
    super(message, EerrorCodes.S3AccessDeniedError, resourceName, action);
  }
}

// Management errors

// Generates an error based on the class on which it is based (error classes describe errors occurring during the operation)
export function generateIResponseError(
  error: any,
  message: string
): IResponseError {
  if (error instanceof TimeoutError) {
    return {
      message: `${message}: server takes too long to respond`,
      resource: error.resourceName,
      errorCode: EerrorCodes.TimeoutError,
    };
  } else if (
    error instanceof S3ServiceNotAvailableError ||
    error instanceof S3AccessDeniedError
  ) {
    return {
      message: `${message}: storage service not available`,
      resource: error.resourceName,
      errorCode: EerrorCodes.S3ServiceNotAvailableError,
    };
  } else if (error instanceof FileNotFoundError) {
    return {
      message: `${message}: file doesn't exist`,
      resource: error.resourceName,
      errorCode: EerrorCodes.FileNotFoundError,
    };
  } else if (error instanceof ResourceNotFoundError) {
    return {
      message: `${message}: resource doesn't exist`,
      resource: error.resourceName,
      errorCode: EerrorCodes.ResourceNotFoundError,
    };
  } else if (error instanceof NotIsRedableError) {
    return {
      message: `${message}: The content file is corrupted, unreadable or invalid`,
      resource: error.resourceName,
      errorCode: EerrorCodes.NotIsRedableError,
    };
  } else if (error instanceof DBConnectionError) {
    return {
      message: `${message}: database not available`,
      resource: error.resourceName,
      errorCode: EerrorCodes.DBConnectionError,
    };
  } else if (error instanceof UnsupportedFileTypeError) {
    return {
      message: `${message}: unssupported file type or invalid file`,
      resource: error.resourceName,
      errorCode: EerrorCodes.UnsupportedFileTypeError,
    };
  } else {
    console.error(error);

    return {
      message: `${message}: unknown error`,
      errorCode: EerrorCodes.UnknownError,
    };
  }
}

// Management S3 errors
export function s3ErrorHandler(
  error: any,
  message: string,
  resourceName?: string,
  action?: string
): void {
  if (error instanceof TimeoutError) {
    throw new TimeoutError(
      `${message}: storage service takes too long to respond `,
      resourceName,
      action
    );
  } else if (
    error.code === "ENOTFOUND" ||
    error.code === "ECONNREFUSED" ||
    error instanceof S3ServiceNotAvailableError
  ) {
    throw new S3ServiceNotAvailableError(
      `${message}: storage service not available`,
      resourceName,
      action
    );
  } else if (
    (error.$metadata && error.$metadata.httpStatusCode === 404) ||
    error instanceof FileNotFoundError
  ) {
    throw new FileNotFoundError(
      `${message}: file doesn't exist`,
      resourceName,
      action
    );
  } else if (error instanceof NotIsRedableError) {
    throw new NotIsRedableError(
      `${message}: The file doesn't appear to be a Redable`,
      resourceName,
      action
    );
  } else if (
    (error.$metadata && error.$metadata.httpStatusCode === 403) ||
    error instanceof S3AccessDeniedError
  ) {
    throw new S3AccessDeniedError(
      `${message}: Access denied to the storage service, check permission of access account`,
      resourceName,
      action
    );
  } else {
    console.error(error);
    throw new UnknownError(`${message}: unknow error`, resourceName, action);
  }
}

// Returns a generated error and a status code according to the type of error
export function generateResponseClientError(
  error: any,
  message: string
): IResponseClientError {
  if (error instanceof ZodError) {
    return {
      status: 400,
      error: {
        message: error.issues.map((issue) => issue.message),
        errorCode: EerrorCodes.ValidationDataError,
      },
    };
  } else {
    const responseClientError = generateIResponseError(error, message);

    if (
      error instanceof FileNotFoundError ||
      error instanceof ResourceNotFoundError
    ) {
      return {
        status: 404,
        error: responseClientError,
      };
    } else if (error instanceof TimeoutError) {
      return {
        status: 408,
        error: responseClientError,
      };
    } else if (error instanceof UnsupportedFileTypeError) {
      return {
        status: 415,
        error: responseClientError,
      };
    } else {
      return {
        status: 500,
        error: responseClientError,
      };
    }
  }
}
