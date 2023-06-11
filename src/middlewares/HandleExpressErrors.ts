import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { EerrorCodes } from "../types";

function HandleExpressErrors(
  error: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error);

  res.status(500).json({
    message: "Error processing request: unknown error",
    errorCode: EerrorCodes.UnknownError,
  });
}

export default HandleExpressErrors;
