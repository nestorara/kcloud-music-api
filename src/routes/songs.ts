import { Router } from "express";

import * as SongsController from "../controllers/SongsController";
import HandleUploadError from "../middlewares/HandleUploadError";
import * as GenericController from "../controllers/GenericController";
import Song from "../models/song";
import disabledFunctionalitie from "../middlewares/disabledFunctionalitie";

const router = Router();

router.get(
  "/getURL/songFile/:id",
  disabledFunctionalitie("SHARED_MUSIC"),
  GenericController.getFileURL(Song, "songFile")
);

router.get(
  "/getURL/songFile",
  disabledFunctionalitie("SHARED_MUSIC"),
  GenericController.manageIdRequiredInRoutes
);

router.get(
  "/getURL/cover/:id",
  disabledFunctionalitie("SHARED_MUSIC"),
  GenericController.getFileURL(Song, "cover")
);

router.get(
  "/getURL/cover",
  disabledFunctionalitie("SHARED_MUSIC"),
  GenericController.manageIdRequiredInRoutes
);

router.get(
  "/download/songFile/:id",
  GenericController.downloadFile(Song, "songFile")
);

router.get("/download/songFile", GenericController.manageIdRequiredInRoutes);

router.get(
  "/download/cover/:id",
  GenericController.downloadFile(Song, "cover")
);

router.get("/download/cover", GenericController.manageIdRequiredInRoutes);

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
