import { Schema, model } from "mongoose";
import { ISong } from "../types";

const song_fileSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const songSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    genres: [String],
    artists: [String],
    albums: [String],
    songFile: song_fileSchema,
    cover: song_fileSchema,
    accountId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model<ISong>("Song", songSchema);
