import { NextFunction, Request, Response } from "express";
import { connection } from "mongoose";

import { EerrorCodes } from "../types";

function checkDBStatus(req: Request, res: Response, next: NextFunction) {
  if (connection.readyState === 1) {
    next();
  } else if (connection.readyState === 2) {
    return res.status(503).json({
      message: "Error processing request: connection to database in progress",
      errorCode: EerrorCodes.DBConnectionInProgressError,
    });
  } else {
    return res.status(500).json({
      message: "Error processing request: database not available",
      errorCode: EerrorCodes.DBConnectionError,
    });
  }
}

export default checkDBStatus;
