"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = require("multer");
const multer_2 = __importDefault(require("../libs/multer"));
const config_1 = require("../config");
const types_1 = require("../types");
function HandleUploadError(fields) {
    return (req, res, next) => {
        // Contains multer middleware to management errors
        const uploadMiddleware = multer_2.default.fields(fields);
        uploadMiddleware(req, res, (error) => {
            if (error) {
                if (error instanceof multer_1.MulterError) {
                    if (error.code === "LIMIT_UNEXPECTED_FILE") {
                        const repeatedField = fields.find((field) => field.name === error.field);
                        return res.status(400).json({
                            message: `the ${error.field} field cannot appear more than ${repeatedField === null || repeatedField === void 0 ? void 0 : repeatedField.maxCount} time/s`,
                            errorCode: types_1.EerrorCodes.DuplicateFieldsError,
                        });
                    }
                    if (error.code === "LIMIT_FILE_SIZE") {
                        return res.status(500).json({
                            message: `The file in the ${error.field} field exceeds the maximux size, size in bytes is: ${config_1.MAXFILESIZE}`,
                            errorCode: types_1.EerrorCodes.FileSizeLimitError,
                            size: config_1.MAXFILESIZE,
                        });
                    }
                }
                else {
                    console.error(error);
                    return res.status(500).json({
                        message: "Unknow error while processing the files",
                        errorCode: types_1.EerrorCodes.UnknownError,
                    });
                }
            }
            next();
        });
    };
}
exports.default = HandleUploadError;
