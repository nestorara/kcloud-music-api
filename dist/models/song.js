"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const song_fileSchema = new mongoose_1.Schema({
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
}, {
    _id: false,
});
const songSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true,
    versionKey: false,
});
exports.default = (0, mongoose_1.model)("Song", songSchema);
