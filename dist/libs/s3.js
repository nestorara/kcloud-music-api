"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const stream_1 = require("stream");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const errors_1 = require("./errors");
class S3Storage {
    constructor() {
        this.client = new client_s3_1.S3Client({
            region: config_1.BUCKET_REGION,
            credentials: {
                accessKeyId: config_1.BUCKET_ACCESS_KEY,
                secretAccessKey: config_1.BUCKET_SECRET_KEY,
            },
            endpoint: config_1.BUCKET_ENDPOINT,
            forcePathStyle: true,
        });
        this.timeout = 300 * 1000; // 5 min
    }
    uploadFile(file, resourceName, action = "uploadFile") {
        return __awaiter(this, void 0, void 0, function* () {
            const { size, buffer, originalname } = file;
            const extension = path_1.default.extname(originalname);
            const filename = (0, uuid_1.v4)() + extension;
            try {
                const stream = stream_1.Readable.from(buffer);
                const params = {
                    Bucket: config_1.BUCKET_NAME,
                    Key: filename,
                    ContentLength: size,
                    Body: stream,
                };
                const command = new client_s3_1.PutObjectCommand(params);
                yield this.executeS3Command(this.timeout, command, resourceName, action);
                return filename;
            }
            catch (error) {
                throw (0, errors_1.s3ErrorHandler)(error, "Error uploading file", resourceName, action);
            }
        });
    }
    deleteFile(filename, resourceName, action = "deleteFile") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.checkfileExist(filename, resourceName, action);
                const params = {
                    Bucket: config_1.BUCKET_NAME,
                    Key: filename,
                };
                const command = new client_s3_1.DeleteObjectCommand(params);
                yield this.executeS3Command(30 * 1000 /* 30 segundos */, command, resourceName, action);
            }
            catch (error) {
                (0, errors_1.s3ErrorHandler)(error, "Error deleting file", resourceName, action);
            }
        });
    }
    downloadFile(filename, resourceName, action = "downloadFile") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.checkfileExist(filename, resourceName, action);
                const params = {
                    Bucket: config_1.BUCKET_NAME,
                    Key: filename,
                };
                const command = new client_s3_1.GetObjectCommand(params);
                const file = yield this.executeS3Command(this.timeout, command, resourceName, action);
                if (file.Body instanceof stream_1.Readable) {
                    return {
                        fileSize: file.ContentLength,
                        fileData: file.Body,
                    };
                }
                else {
                    throw new errors_1.NotIsRedableError("The file doesn't appear to be a Redable", resourceName, action);
                }
            }
            catch (error) {
                throw (0, errors_1.s3ErrorHandler)(error, "Error downloading file", resourceName, action);
            }
        });
    }
    getFileURL(filename, expiresIn = 60 * 4 /* 4 min */, resourceName, action = "getFileURL") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    Bucket: config_1.BUCKET_NAME,
                    Key: filename,
                };
                yield this.checkfileExist(filename, resourceName, action);
                const command = new client_s3_1.GetObjectCommand(params);
                const url = yield (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn });
                return url;
            }
            catch (error) {
                throw (0, errors_1.s3ErrorHandler)(error, "Error generating file url", resourceName, action);
            }
        });
    }
    checkfileExist(filename, resourceName, action = "checkfileExist") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    Bucket: config_1.BUCKET_NAME,
                    Key: filename,
                };
                const command = new client_s3_1.HeadObjectCommand(params);
                yield this.executeS3Command(12 * 1000 /* 12 sec */, command, resourceName, action);
                return true;
            }
            catch (error) {
                throw (0, errors_1.s3ErrorHandler)(error, "Error checking if file exists", resourceName, action);
            }
        });
    }
    CheckServiceStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = {
                    Bucket: config_1.BUCKET_NAME,
                };
                const storage = new S3Storage();
                const command = new client_s3_1.HeadBucketCommand(params);
                yield storage.client.send(command);
                // if service is availble return true
                return true;
            }
            catch (_a) {
                throw new errors_1.S3ServiceNotAvailableError("storage service not available");
            }
        });
    }
    executeS3Command(time, command, resourceName, action = "executeS3Command") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield Promise.race([
                    this.client.send(command),
                    new Promise((_, reject) => {
                        setTimeout(() => reject(new errors_1.TimeoutError("Error executing s3 command: storage service takes too long to respond", resourceName, action)), time);
                    }),
                ]);
                return result;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.default = S3Storage;
