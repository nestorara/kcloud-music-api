"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiredENV = exports.supportedImageMimetypes = exports.supportedAudioMimetypes = exports.EerrorCodes = void 0;
var EerrorCodes;
(function (EerrorCodes) {
    EerrorCodes["UnknownError"] = "UNKNOWNERROR";
    EerrorCodes["NotIsRedableError"] = "NOTISREDABLEERROR";
    EerrorCodes["S3ServiceNotAvailableError"] = "S3SERVICENOTAVAILABLEERROR";
    EerrorCodes["FileNotFoundError"] = "FILENOTFOUNDERROR";
    EerrorCodes["SongNotFoundError"] = "SONGNOTFOUNDERROR";
    EerrorCodes["ValidationDataError"] = "VALIDATIONDATAERROR";
    EerrorCodes["DuplicateFieldsError"] = "DUPLICATEFIELDSERROR";
    EerrorCodes["FileSizeLimitError"] = "FILESIZELIMITERROR";
    EerrorCodes["MissingParameterError"] = "MISSINGPARAMETERERROR";
    EerrorCodes["TimeoutError"] = "TIMEOUTERROR";
    EerrorCodes["ResourceNotFoundError"] = "RESOURCENOTFOUNDERROR";
    EerrorCodes["DBConnectionError"] = "DBCONNECTIONERROR";
    EerrorCodes["DBConnectionInProgressError"] = "DBCONNECTIONINPROGRESSERROR";
    // Error when a route does not exist, equivalent to 404 error
    EerrorCodes["PathNotFound"] = "PATHNOTFOUND";
    EerrorCodes["UnsupportedFileTypeError"] = "UNSUPPORTEDFILETYPEERROR";
    // When the resource has no assigned value or it is empty
    EerrorCodes["EmptyResourceError"] = "EMPTYRESOURCEERROR";
    EerrorCodes["DisabledFunctionalitieError"] = "DISABLEDFUNCTIONALITIEERROR";
})(EerrorCodes || (exports.EerrorCodes = EerrorCodes = {}));
exports.supportedAudioMimetypes = [
    "audio/wave",
    "audio/webm",
    "audio/ogg",
    "audio/mpeg",
    "audio/mp4",
];
exports.supportedImageMimetypes = [
    "image/gif",
    "image/jpeg",
    "image/svg+xml",
    "image/webp",
    "image/png",
];
exports.requiredENV = [
    "BUCKET_NAME",
    "BUCKET_SECRET_KEY",
    "BUCKET_ACCESS_KEY",
    "BUCKET_REGION",
    "BUCKET_ENDPOINT",
    "DB_HOST",
    "DB_DATABASE",
    "DB_USER",
    "DB_PASSWORD",
];
