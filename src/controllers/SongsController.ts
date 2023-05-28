import { Request, Response } from "express";

import { ESongFiles, EerrorCodes, IRequestFile, IRequestFiles } from "../types";
import S3Storage from "../libs/s3";
import Song from "../models/song";
import { convertStrTolist, filterFields } from "../utils";
import {
  Song_ReqFilesSchema,
  createSongSchema,
  mongodb_idSchema,
  updateSongSchema,
  validateFile,
  validateReqFiles,
} from "../zodSchemas";
import { FileNotFoundError, TimeoutError, UnknownError, generateDataValidationResponseError } from "../libs/errors";
import { ZodError } from "zod";

const storage = new S3Storage();

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
    if (error instanceof ZodError) {
      return generateDataValidationResponseError(res, error);
    } else {
      return res.status(500).json({
        message: "An unknown error occurred while getting the songs",
        errorCode: EerrorCodes.unknown,
      });
    }
  }
}

export async function getSong(req: Request, res: Response) {
  try {
    const { id } = req.params;

    mongodb_idSchema.parse(id);

    const song = await Song.findById(id).select(displayFields);

    if (!song) {
      return res.status(404).json({
        message: "The song doesn't exist",
        errorCode: EerrorCodes.songNotExist,
      });
    }

    return res.json(song);
  } catch (error) {
    if (error instanceof ZodError) {
      return generateDataValidationResponseError(res, error);
    } else {
      return res.status(500).json({
        message: "An unknown error occurred while getting the song",
        errorCode: EerrorCodes.unknown,
      });
    }
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

    const RequestFilesSchema = Song_ReqFilesSchema.required({
      song: true,
    });

    // Validate if the files comply with the expected schema and are files
    validateReqFiles(files, RequestFilesSchema, ["song", "cover"]);

    let data = {};

    const song = files.song[0] as IRequestFile;

    const songUploaded = await storage.uploadFile(song);

    if (files["cover"]) {
      const cover = files.cover[0] as IRequestFile;

      const coverUploaded = await storage.uploadFile(cover);

      data = {
        name,
        genres,
        artists,
        albums,
        songFile: songUploaded,
        cover: coverUploaded,
        accountId,
      };
    } else {
      data = {
        name,
        genres,
        artists,
        albums,
        songFile: songUploaded,
        accountId,
      };
    }

    const newSong = new Song(data);

    newSong.save();

    const finalSong = await Song.findById(newSong._id).select(displayFields);

    return res.json(finalSong);
  } catch (e: any) {
    if (e instanceof ZodError) {
      return generateDataValidationResponseError(res, e);
    } else {
      return res.status(500).json({
        message: "An unknown error occurred while creating the song",
        errorCode: EerrorCodes.unknown,
      });
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

    if (
      (!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) &&
      (!req.files || Object.keys(req.files).length === 0)
    ) {
      return res.status(400).json({
        message:
          "At least one field must be provided to update or the name of the provided properties are invalid",
        errorCode: EerrorCodes.validationDataError,
      });
    }

    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({
        message: "The song provided doesn't exist",
        errorCode: EerrorCodes.songNotExist,
      });
    }

    const files = req.files as IRequestFiles;

    if (files["cover"]) {
      const cover = files.cover[0];

      // Check if cover is a valid file
      validateFile(cover);

      const coverUploaded = await storage.uploadFile(cover);

      if (song.cover) {
        await storage.deleteFile(song.cover);
      }

      fieldsToUpdate["cover"] = coverUploaded;
    }

    const updatedSong = await Song.findByIdAndUpdate(id, fieldsToUpdate, {
      new: true,
      fields: "_id name genres artists albums createdAt updatedAt",
    });

    return res.json(updatedSong);
  } catch (error) {
    if (error instanceof ZodError) {
      return generateDataValidationResponseError(res, error);
    } else {
      return res.status(500).json({
        message: "An unknown error occurred while updating the song",
        errorCode: EerrorCodes.unknown,
      });
    }
  }
}

export async function deleteSong(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const song = await Song.findById(id).select(displayFields);

    if (!song) {
      return res.status(404).json({
        message: "The song doesn't exist",
        errorCode: EerrorCodes.songNotExist,
      });
    }

    try {
      await storage.deleteFile(song.songFile);
    } catch (e: any) {
      if (e.errorCode === EerrorCodes.fileNotFound) {
        return res.status(404).json({
          message:
            "The song could not be deleted because the song file could not be found",
          errorCode: EerrorCodes.fileNotFound,
        });
      } else if (e.errorCode === EerrorCodes.unknown) {
        return res.status(500).json({
          message:
            "The song could not be deleted because an unknown error occurred while deleting the song file",
          errorCode: EerrorCodes.unknownErrorInFileReference,
        });
      } else {
        throw e;
      }
    }

    await Song.findByIdAndRemove(id);

    // Check if cover length is not zero (!! convert result to boolean)
    if (!!song.cover?.length) {
      try {
        await storage.deleteFile(song.cover!);
      } catch (error) {
        if (error instanceof FileNotFoundError) {
          return res.json({
            message:
              "The song has been deleted successfully, but the song cover could not be deleted because the reference file could not be found",
            errorCode: EerrorCodes.fileReferenceNotFound,
            song: song,
          });
        } else if (error instanceof UnknownError) {
          return res.json({
            message:
              "The song was successfully deleted, but the song cover could not be deleted due to an unknown error",
            errorCode: EerrorCodes.unknownErrorInFileReference,
            song: song,
          });
        } else {
          throw error;
        }
      }
    }

    return res.json({
      message: "song deleted successfully",
      errorCode: EerrorCodes.none,
      song: song,
    });
  } catch (e: any) {
    if (e instanceof ZodError) {
      return generateDataValidationResponseError(res, e);
    } else {
      return res.status(500).json({
        message: "An unknown error occurred while deleting the song",
        errorCode: EerrorCodes.unknown,
      });
    }
  }
}

export function getUrl(resource: ESongFiles) {
  return async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      mongodb_idSchema.parse(id);

      const song = await Song.findById(id);

      if (!song) {
        return res.status(404).json({
          message: "The song doesn't exist",
          errorCode: EerrorCodes.songNotExist,
        });
      }

      const url = await storage.getFileURL(song[resource]!);

      return res.json({
        message: "The url of the song generatted successfully",
        errorCode: EerrorCodes.none,
        url,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return generateDataValidationResponseError(res, error);
      } else {
        return res.status(500).json({
          message:
            "An unknown error occurred while getting the url of the file",
          errorCode: EerrorCodes.unknown,
        });
      }
    }
  };
}

export async function downloadSong(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const song = await Song.findById(id);

    const songAudio = await storage.downloadFile(song?.songFile!);

    res.send("Hola");
  } catch (error) {
    if (error instanceof FileNotFoundError) {
      return res.status(404).json({
        message:
          "The song could not be downloaded because the song file could not be found",
        errorCode: EerrorCodes.fileReferenceNotFound,
      });
    } else if (error instanceof TimeoutError) {
      return res.status(408).json({
        message:
          "The song could not be downloaded because the server takes too long to respond",
        errorCode: EerrorCodes.timeout,
      });
    } else {
      return res.status(500).json(error);
    }
  }
}
