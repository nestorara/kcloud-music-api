import { Schema, model } from "mongoose"
import { ISong } from "../types_and_interfaces"

const songSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    genre: [String],
    artists: [String],
    album: [String],
    songFile: {
        type: String,
        required: true
    },
    cover: String,
    accountId: {
        type: String,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
})

export default model<ISong>("Song", songSchema)