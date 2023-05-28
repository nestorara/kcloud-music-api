import { Router } from "express";

import * as SongsController from "../controllers/SongsController";
import HandleUploadError from "../middlewares/HandleUploadError";
import * as GenericController from "../controllers/GenericController";
import { ESongFiles } from "../types";

const router = Router();

router.get("/songFile/:id", SongsController.getUrl(ESongFiles.songFile));

router.get("/songFile", GenericController.manageIdRequiredInRoutes)

router.get("/cover/:id", SongsController.getUrl(ESongFiles.cover));

router.get("/cover", GenericController.manageIdRequiredInRoutes)

router.get("/download/:id", SongsController.downloadSong)

router.get("/:id", SongsController.getSong);

router.get("/", SongsController.getSongs);

router.post(
  "/",
  HandleUploadError([
    { name: "cover", maxCount: 1 },
    { name: "song", maxCount: 1 },
  ]),
  SongsController.createSong
);

router.patch(
  "/:id",
  HandleUploadError([{ name: "cover", maxCount: 1 }]),
  SongsController.updateSong
);

router.delete("/:id", SongsController.deleteSong);

export default router;
