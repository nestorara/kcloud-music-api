import { Request, Response } from "express";

import { EerrorCodes } from "../types";
import { mongodb_idSchema } from "../zodSchemas";
import { Document, Model } from "mongoose";
import { getExtensionOfMimetype, modelUtils } from "../utils";
import S3Storage from "../libs/s3";
import { FileNotFoundError, generateResponseClientError } from "../libs/errors";

const storage = new S3Storage();

// To manage routes that specifically need an id
export function manageIdRequiredInRoutes(req: Request, res: Response) {
  res.status(400).json({
    message: "The id parameter is required",
    errorCode: EerrorCodes.MissingParameterError,
  });
}

/* Get url for the file in storage service.
   Note: hiddenName is the name to show to the user
   to hidden the real resource name*/
export function getFileURL<T extends Document>(
  model: Model<T>,
  resourceName: string,
  hiddenName?: string
) {
  return async (req: Request, res: Response) => {
    try {
      const resourceNameToShow = hiddenName ?? resourceName;

      const { id } = req.params;

      mongodb_idSchema.parse(id);

      // Object to work with the collection corresponding to the model
      const collectionUtils = new modelUtils(model);

      const resource = (await collectionUtils.findById(
        id,
        undefined,
        resourceName,
        "getFileURL"
      )) as T;

      const fileName = resource.get(resourceName)?.fileName;

      if (typeof fileName !== "undefined") {
        const url = await storage.getFileURL(
          fileName,
          undefined,
          resourceNameToShow
        );

        return res.json({ url });
      } else {
        return res.status(404).json({
          message: `Error generating url: ${resourceNameToShow} not assigned`,
          resource: resourceNameToShow,
          errorCode: EerrorCodes.EmptyResourceError,
        });
      }
    } catch (error) {
      const response = generateResponseClientError(
        error,
        "Error generating url"
      );

      return res.status(response.status).json(response.error);
    }
  };
}

// Download the file from the storage server retrieved from the database
export function downloadFile<T extends Document>(
  model: Model<T>,
  resourceName: string,
  hiddenName?: string
) {
  return async (req: Request, res: Response) => {
    try {
      const resourceNameToShow = hiddenName ?? resourceName;

      const { id } = req.params;

      mongodb_idSchema.parse(id);

      // Object to work with the collection corresponding to the model
      const collectionUtils = new modelUtils(model);

      const resource = (await collectionUtils.findById(
        id,
        undefined,
        resourceName,
        "downloadFile"
      )) as T;

      const fileName = resource.get(resourceName)?.fileName;

      if (typeof fileName !== "undefined") {
        const mimetype = resource.get(resourceName)?.mimetype;
        const { fileData } = await storage.downloadFile(
          fileName,
          resourceNameToShow
        );
        const extension = getExtensionOfMimetype(mimetype)[0];
        const resourceDBName = resource.get("name");

        res.attachment(`${resourceDBName}.${extension}`);
        fileData.pipe(res);
      } else {
        return res.status(404).json({
          message: `Error downloading file: ${resourceNameToShow} not assigned`,
          resource: resourceNameToShow,
          errorCode: EerrorCodes.EmptyResourceError,
        });
      }
    } catch (error) {
      const response = generateResponseClientError(
        error,
        "Error downloading file"
      );

      return res.status(response.status).json(response.error);
    }
  };
}

export function pathNotFound(req: Request, res: Response) {
  return res.status(404).json({
    message: "Path not found: error 404",
    errorCode: EerrorCodes.PathNotFound,
  });
}
