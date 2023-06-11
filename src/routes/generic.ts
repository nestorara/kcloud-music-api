import { NextFunction, Request, Response, Router } from "express";

import { pathNotFound } from "../controllers/GenericController";

const router = Router();

router.all("*", pathNotFound);

export default router;
