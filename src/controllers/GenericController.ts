import { Request, Response } from "express";

import { EerrorCodes } from "../types";

// To manage routes that specifically need an id
export function manageIdRequiredInRoutes(req: Request, res: Response) {
  res.status(400).json({
    message: "The id parameter is required",
    errorCode: EerrorCodes.missingParameter,
  });
}
