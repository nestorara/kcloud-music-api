import { Request, Response, Router } from "express";

import * as songsController from "../controllers/SongsController";
import upload from "../libs/multer";

const router = Router();

// List songs from database
router.get("/", songsController.getSongs);

// Download song
router.get("/songFile/:id", songsController.getSongFile)

// Download conver
router.get("/cover/:id", songsController.getCover)

// Get song metadata by id
router.get("/:id", songsController.getSong);

// Create and load songs and metadata
router.post(
  "/",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "song", maxCount: 1 },
  ]),
  songsController.createSong
);

// Update metadata of song
router.patch("/:id", upload.single("cover"), songsController.updateSong);

// Delete song and metadata
router.delete("/:id", songsController.deleteSong);

export default router;