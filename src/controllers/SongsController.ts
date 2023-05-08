import { Request, Response } from "express";

import { IFile, IRequestFiles } from "../types_and_interfaces";
import S3Storage from "../libs/s3";
import Song from "../models/song";
import { convertStrTolist, createMongooseSelectObject } from "../utils";

const storage = new S3Storage();

export async function getSongs(req: Request, res: Response) {
  try {
    const songs = await Song.find();
    return res.json(songs);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "An unknow error has been ocurred while deleting file",
      error: e,
    });
  }
}

export async function getSong(req: Request, res: Response) {
  try {
    const song = await Song.findById(req.params.id);

    if (song == null) {
      return res
        .status(404)
        .json({ success: false, message: "The song doesn't exist" });
    }

    return res.json(song);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "An unknow error has been ocurred while deleting file",
      error: e,
    });
  }
}

export async function createSong(req: Request, res: Response) {
  const { name, genre, artists, album, accountId } = req.body;
  const files = req.files as IRequestFiles;
  const song = files.song[0] as IFile;
  const cover = files.cover[0] as IFile;
  const genre_list = convertStrTolist(genre);
  const artists_list = convertStrTolist(artists);
  const album_list = convertStrTolist(album);

  try {
    const result = await storage.uploadFiles([song, cover]);

    if (!result.success) {
      return res.json(result);
    }

    let conver_uploadedFilename = "";
    let song_uploadedFilename = "";

    result.files?.forEach((file) => {
      if (file.originalname == cover.originalname) {
        conver_uploadedFilename = file.filename;
      } else if (file.originalname == song.originalname) {
        song_uploadedFilename = file.filename;
      }
    });

    const newSong = new Song({
      name,
      genre: genre_list,
      artists: artists_list,
      album: album_list,
      songFile: song_uploadedFilename,
      cover: conver_uploadedFilename,
      accountId,
    });

    newSong.save();

    return res.json(newSong);
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "An unknow error ocurred" });
  }
}

export async function updateSong(req: Request, res: Response) {
  const { id } = req.params;

  const song = await Song.findById(id);

  if (song == null) {
    return res
      .status(404)
      .json({ success: false, message: "The song doesn't exist" });
  }

  if (req.file != null) {
    const cover = req.file as IFile;

    const deleteResult = await storage.deleteFile(song.cover ?? "");

    console.log(deleteResult)

    if (!deleteResult.success) {
      return res.json(deleteResult);
    }

    const uploadResult = await storage.uploadFile(cover)

    if (!uploadResult.success) {
      return res.json(uploadResult);
    }

    console.log(uploadResult)

    req.body.cover = uploadResult.filename
  }

  const select = createMongooseSelectObject([
    "name",
    "genre",
    "artists",
    "album",
    "cover",
  ]);

  const updatedSong = await Song.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    select,
  });

  return res.json(updatedSong);
}

export async function deleteSong(req: Request, res: Response) {
  try {
    const song = await Song.findByIdAndRemove(req.params.id);

    if (song == null) {
      return res
        .status(404)
        .json({ success: false, message: "The song doesn't exist" });
    }

    const result = await storage.deleteFiles([
      song?.songFile ?? "",
      song?.cover ?? "",
    ]);

    if (!result.success) {
      return res.json(result);
    }

    return res.json(song);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "An unknow error has been ocurred while deleting file",
      error: e,
    });
  }
}

export async function getSongFile(req: Request, res: Response) {
  try {
    const song = await Song.findById(req.params.id);
    const expiresIn = 240

    if (song == null) {
      return res
        .status(404)
        .json({ success: false, message: "The song doesn't exist" });
    }

    const url = await storage.getFileURL(song?.songFile ?? "", expiresIn);
    return res.json({ success: true, url });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "An unknow error has been ocurred while deleting file",
      error: e,
    });
  }
}

export async function getCover(req: Request, res: Response) {
  try {
    const song = await Song.findById(req.params.id);
    const expiresIn = 240

    if (song == null) {
      return res
        .status(404)
        .json({ success: false, message: "The song doesn't exist" });
    }

    const url = await storage.getFileURL(song?.cover ?? "", expiresIn);
    return res.json();
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "An unknow error has been ocurred while deleting file",
      error: e,
    });
  }
}
