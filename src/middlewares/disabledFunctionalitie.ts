import { NextFunction, Request, Response } from "express";
import { EerrorCodes } from "../types";

export function disabledFunctionalitie(functionality: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const config: Record<string, string | number | boolean> = await import(
      "../config"
    );

    const enabledFunctionality = config[functionality];

    if (typeof enabledFunctionality === "boolean" && !enabledFunctionality) {
      res.status(403).json({
        message: `The ${functionality} functionality is disabled, to enable this functionality add an environment variable ${functionality} and set the value to true or add this to the .env file`,
        errorCode: EerrorCodes.DisabledFunctionalitieError,
      });
    } else {
      next();
    }
  };
}

export default disabledFunctionalitie;
