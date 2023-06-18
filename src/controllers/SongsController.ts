import { Request, Response } from "express";

import { EerrorCodes, IRequestFile, IRequestFiles, ISong } from "../types";
import S3Storage from "../libs/s3";
import Song from "../models/song";
import {
  modelUtils,
  convertStrTolist,
  filterFields,
  ValidFileType,
} from "../utils";
import {
  Song_CreateReqFilesSchema,
  createSongSchema,
  mongodb_idSchema,
  updateSongSchema,
  validateFile,
  validateReqFiles,
} from "../zodSchemas";
import {
  FileNotFoundError,
  UnknownError,
  generateResponseClientError,
} from "../libs/errors";

const storage = new S3Storage();

const songUtils = new modelUtils(Song);

const displayFields = [
  "_id",
  "name",
  "genres",
  "artists",
  "albums",
  "createdAt",
  "updatedAt",
];

export async function getSongs(req: Request, res: Response) {
  try {
    const songs = await Song.find().select(displayFields);
    return res.json(songs);
  } catch (error) {
    const response = generateResponseClientError(
      error,
      "Error retrieving songs: unknown error"
    );

    return res.status(response.status).json(response.error);
  }
}

export async function getSong(req: Request, res: Response) {
  try {
    const { id } = req.params;

    mongodb_idSchema.parse(id);

    const song = await songUtils.findById(id, displayFields, "song", "getSong");

    return res.json(song);
  } catch (error) {
    const response = generateResponseClientError(
      error,
      "Error retrieving the song"
    );

    return res.status(response.status).json(response.error);
  }
}

export async function createSong(req: Request, res: Response) {
  try {
    createSongSchema.parse(req.body);

    const { name, accountId } = req.body;

    const genres = convertStrTolist(req.body.genres);

    const artists = convertStrTolist(req.body.artists);

    const albums = convertStrTolist(req.body.albums);

    const files = req.files as IRequestFiles;

    // Validate if the files comply with the expected schema and are files
    validateReqFiles(files, Song_CreateReqFilesSchema, ["song", "cover"]);

    let newSong = new Song({
      name,
      genres,
      artists,
      albums,
      accountId: accountId,
    });

    const song = files.song[0] as IRequestFile;

    ValidFileType("audio", song, "song");

    if (files["cover"]) {
      const cover = files.cover[0] as IRequestFile;

      ValidFileType("image", cover, "cover");

      const coverUploaded = await storage.uploadFile(cover, "cover");

      newSong.cover = {
        fileName: coverUploaded,
        size: cover.size,
        mimetype: cover.mimetype,
      };
    }

    const songUploaded = await storage.uploadFile(song);

    newSong.songFile = {
      fileName: songUploaded,
      size: song.size,
      mimetype: song.mimetype,
    };

    await newSong.save();

    const finalSong = songUtils.filterDocument(newSong, displayFields)

    return res.json(finalSong);
  } catch (error) {
    if (error instanceof UnknownError && error.action === "uploadFile") {
      return res.status(500).json({
        message:
          "Error creating the song: unable to upload files due to unknown error",
        errorCode: EerrorCodes.UnknownError,
      });
    } else {
      const response = generateResponseClientError(
        error,
        "Error creating song"
      );

      return res.status(response.status).json(response.error);
    }
  }
}

export async function updateSong(req: Request, res: Response) {
  try {
    const { id } = req.params;

    mongodb_idSchema.parse(id);

    updateSongSchema.parse(req.body);

    const permittedFields = ["genres", "artists", "albums"];

    const fieldsToUpdate = filterFields(req.body, permittedFields);

    // if the form is empty and the client doesn't provide any file or the file field is empty, then return error
    if (
      (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) &&
      (!req.files || Object.keys(req.files).length === 0)
    ) {
      return res.status(400).json({
        message:
          "Error updating song: At least one field must be provided to update or the name of the provided properties are invalid",
        errorCode: EerrorCodes.ValidationDataError,
      });
    }

    const song = (await songUtils.findById(
      id,
      undefined,
      "song",
      "updateSong"
    )) as ISong;

    const files = req.files as IRequestFiles;

    if (files["cover"]) {
      const cover = files.cover[0];

      // Check if cover is a valid file
      validateFile(cover);

      ValidFileType("image", cover, "cover");

      const coverUploaded = await storage.uploadFile(cover);

      const oldCoverFileName = song.get("cover")?.fileName;

      try {
        await storage.deleteFile(oldCoverFileName);
      } catch (error) {
        if (
          !(error instanceof UnknownError) &&
          !(error instanceof FileNotFoundError)
        ) {
          throw error;
        }
      }

      fieldsToUpdate["cover"] = {
        fileName: coverUploaded,
        size: cover.size,
        mimetype: cover.mimetype,
      };
    }

    const updatedSong = await songUtils.findByIdAndUpdate(
      id,
      displayFields,
      "song",
      "updateSong",
      fieldsToUpdate,
      {
        new: true,
      }
    );

    return res.json(updatedSong);
  } catch (error) {
    if (error instanceof UnknownError && error.action === "uploadFile") {
      return res.status(500).json({
        message:
          "Error updating song: unable to upload new cover due to unknown error",
        errorCode: EerrorCodes.UnknownError,
      });
    } else {
      const response = generateResponseClientError(
        error,
        "Error updating song"
      );

      return res.status(response.status).json(response.error);
    }
  }
}

export async function deleteSong(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const song = (await songUtils.findByIdAndDelete(
      id,
      undefined,
      "song",
      "deleteSong"
    )) as ISong;

    const songFileName = song.get("songFile").fileName;

    try {
      await storage.deleteFile(songFileName);
    } catch (error) {
      if (
        !(error instanceof UnknownError) &&
        !(error instanceof FileNotFoundError)
      ) {
        throw error;
      }
    }

    const coverFileName = song.get("cover")?.fileName;

    try {
      await storage.deleteFile(coverFileName);
    } catch (error) {
      if (
        !(error instanceof UnknownError) &&
        !(error instanceof FileNotFoundError)
      ) {
        throw error;
      }
    }

    const songFilter = songUtils.filterDocument(song, displayFields);

    return res.json(songFilter);
  } catch (error) {
    const response = generateResponseClientError(error, "Error deleting song");

    return res.status(response.status).json(response.error);
  }
}
