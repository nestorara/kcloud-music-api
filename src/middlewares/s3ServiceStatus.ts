import { NextFunction, Request, Response } from "express";
import { checkS3ServiceStatus } from "../utils";

async function s3ServiceStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const S3ServiceStatus = await checkS3ServiceStatus();

  // If service is not available, it return an error to the client
  if (!S3ServiceStatus) {
    return res.status(503).send("Servicio no disponible temporalmente");
  }

  // If service is available, continue with the request
  next();
}

export default s3ServiceStatus;