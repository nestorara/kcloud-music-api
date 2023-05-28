import { Schema, model } from "mongoose";
import { ISong } from "../types";

const songSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    genres: [String],
    artists: [String],
    albums: [String],
    songFile: {
      type: String,
      required: true,
    },
    cover: String,
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
