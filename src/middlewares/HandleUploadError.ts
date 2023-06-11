import { MulterError, Field as multerField } from "multer";

import upload from "../libs/multer";
import { NextFunction, Request, Response } from "express";
import { MAXFILESIZE } from "../config";
import { EerrorCodes } from "../types";

function HandleUploadError(fields: multerField[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Contains multer middleware to management errors
    const uploadMiddleware = upload.fields(fields);

    uploadMiddleware(req, res, (error) => {
      if (error) {
        if (error instanceof MulterError) {
          if (error.code === "LIMIT_UNEXPECTED_FILE") {
            const repeatedField = fields.find(
              (field) => field.name === error.field
            );

            return res.status(400).json({
              message: `the ${error.field} field cannot appear more than ${repeatedField?.maxCount} time/s`,
              errorCode: EerrorCodes.DuplicateFieldsError,
            });
          }

          if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(500).json({
              message: `The file in the ${error.field} field exceeds the maximux size, size in bytes is: ${MAXFILESIZE}`,
              errorCode: EerrorCodes.FileSizeLimitError,
              size: MAXFILESIZE,
            });
          }
        } else {
          console.error(error);

          return res.status(500).json({
            message: "Unknow error while processing the files",
            errorCode: EerrorCodes.UnknownError,
          });
        }
      }

      next();
    });
  };
}

export default HandleUploadError;
