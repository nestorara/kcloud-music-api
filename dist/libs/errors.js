"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResponseClientError = exports.s3ErrorHandler = exports.generateIResponseError = exports.UnsupportedFileTypeError = exports.DBConnectionError = exports.TimeoutError = exports.ResourceNotFoundError = exports.FileNotFoundError = exports.S3ServiceNotAvailableError = exports.NotIsRedableError = exports.UnknownError = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
// Errors:
class BaseError extends Error {
    constructor(message, code, resourceName, action) {
        super(message);
        this.code = code;
        this.resourceName = resourceName;
        this.action = action;
    }
}
// This error is used to indicate that an unknown error has occurred
class UnknownError extends BaseError {
    constructor(message, resourceName, action) {
        super(message, types_1.EerrorCodes.UnknownError, resourceName, action);
    }
}
exports.UnknownError = UnknownError;
// This error is used to indicate that the contents of the file is corrupted, unreadable or invalid
class NotIsRedableError extends BaseError {
    constructor(message, resourceName, action) {
        super(message, types_1.EerrorCodes.NotIsRedableError, resourceName, action);
    }
}
exports.NotIsRedableError = NotIsRedableError;
// This error is used to indicate that the s3 service is not running or has an error
class S3ServiceNotAvailableError extends BaseError {
    constructor(message, resourceName, action) {
        super(message, types_1.EerrorCodes.S3ServiceNotAvailableError, resourceName, action);
    }
}
exports.S3ServiceNotAvailableError = S3ServiceNotAvailableError;
// This error is used to indicate that the song file could not be found
class FileNotFoundError extends BaseError {
    constructor(message, resourceName, action) {
        super(message, types_1.EerrorCodes.FileNotFoundError, resourceName, action);
    }
}
exports.FileNotFoundError = FileNotFoundError;
// This error is used to indicate that the resource doesn't found
class ResourceNotFoundError extends BaseError {
    constructor(message, resourceName, action) {
        super(message, types_1.EerrorCodes.ResourceNotFoundError, resourceName, action);
    }
}
exports.ResourceNotFoundError = ResourceNotFoundError;
// This error is used to indicate that the operation has taken too long to respond
class TimeoutError extends BaseError {
    constructor(message, resourceName, action) {
        super(message, types_1.EerrorCodes.TimeoutError, resourceName, action);
    }
}
exports.TimeoutError = TimeoutError;
// This error is used to indicate that database is not ready
class DBConnectionError extends BaseError {
    constructor(message, resourceName, action) {
        super(message, types_1.EerrorCodes.DBConnectionError, resourceName, action);
    }
}
exports.DBConnectionError = DBConnectionError;
class UnsupportedFileTypeError extends BaseError {
    constructor(message, resourceName, action) {
        super(message, types_1.EerrorCodes.UnsupportedFileTypeError, resourceName, action);
    }
}
exports.UnsupportedFileTypeError = UnsupportedFileTypeError;
// Management errors
// Generates an error based on the class on which it is based (error classes describe errors occurring during the operation)
function generateIResponseError(error, message) {
    if (error instanceof TimeoutError) {
        return {
            message: `${message}: server takes too long to respond`,
            resource: error.resourceName,
            errorCode: types_1.EerrorCodes.TimeoutError,
        };
    }
    else if (error instanceof S3ServiceNotAvailableError) {
        return {
            message: `${message}: storage service not available`,
            resource: error.resourceName,
            errorCode: types_1.EerrorCodes.S3ServiceNotAvailableError,
        };
    }
    else if (error instanceof FileNotFoundError) {
        return {
            message: `${message}: file doesn't exist`,
            resource: error.resourceName,
            errorCode: types_1.EerrorCodes.FileNotFoundError,
        };
    }
    else if (error instanceof ResourceNotFoundError) {
        return {
            message: `${message}: resource doesn't exist`,
            resource: error.resourceName,
            errorCode: types_1.EerrorCodes.ResourceNotFoundError,
        };
    }
    else if (error instanceof NotIsRedableError) {
        return {
            message: `${message}: The content file is corrupted, unreadable or invalid`,
            resource: error.resourceName,
            errorCode: types_1.EerrorCodes.NotIsRedableError,
        };
    }
    else if (error instanceof DBConnectionError) {
        return {
            message: `${message}: database not available`,
            resource: error.resourceName,
            errorCode: types_1.EerrorCodes.DBConnectionError,
        };
    }
    else if (error instanceof UnsupportedFileTypeError) {
        return {
            message: `${message}: unssupported file type or invalid file`,
            resource: error.resourceName,
            errorCode: types_1.EerrorCodes.UnsupportedFileTypeError,
        };
    }
    else {
        console.error(error);
        return {
            message: `${message}: unknown error`,
            errorCode: types_1.EerrorCodes.UnknownError,
        };
    }
}
exports.generateIResponseError = generateIResponseError;
// Management S3 errors
function s3ErrorHandler(error, message, resourceName, action) {
    if (error instanceof TimeoutError) {
        throw new TimeoutError(`${message}: server takes too long to respond`, resourceName, action);
    }
    else if (error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED" ||
        error instanceof S3ServiceNotAvailableError) {
        throw new S3ServiceNotAvailableError(`${message}: storage service not available`, resourceName, action);
    }
    else if (error.name === "NotFound" || error instanceof FileNotFoundError) {
        throw new FileNotFoundError(`${message}: file doesn't exist`, resourceName, action);
    }
    else if (error instanceof NotIsRedableError) {
        throw new NotIsRedableError(`${message}: The file doesn't appear to be a Redable`, resourceName, action);
    }
    else {
        console.error(error);
        throw new UnknownError(`${message}: unknow error`, resourceName, action);
    }
}
exports.s3ErrorHandler = s3ErrorHandler;
// Returns a generated error and a status code according to the type of error
function generateResponseClientError(error, message) {
    if (error instanceof zod_1.ZodError) {
        return {
            status: 400,
            error: {
                message: error.issues.map((issue) => issue.message),
                errorCode: types_1.EerrorCodes.ValidationDataError,
            },
        };
    }
    else {
        const responseClientError = generateIResponseError(error, message);
        if (error instanceof FileNotFoundError ||
            error instanceof ResourceNotFoundError) {
            return {
                status: 404,
                error: responseClientError,
            };
        }
        else if (error instanceof TimeoutError) {
            return {
                status: 408,
                error: responseClientError,
            };
        }
        else if (error instanceof UnsupportedFileTypeError) {
            return {
                status: 415,
                error: responseClientError,
            };
        }
        else {
            return {
                status: 500,
                error: responseClientError,
            };
        }
    }
}
exports.generateResponseClientError = generateResponseClientError;
