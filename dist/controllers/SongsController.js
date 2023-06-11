"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSong = exports.updateSong = exports.createSong = exports.getSong = exports.getSongs = void 0;
const types_1 = require("../types");
const s3_1 = __importDefault(require("../libs/s3"));
const song_1 = __importDefault(require("../models/song"));
const utils_1 = require("../utils");
const zodSchemas_1 = require("../zodSchemas");
const errors_1 = require("../libs/errors");
const storage = new s3_1.default();
const songUtils = new utils_1.modelUtils(song_1.default);
const displayFields = [
    "_id",
    "name",
    "genres",
    "artists",
    "albums",
    "createdAt",
    "updatedAt",
];
function getSongs(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const songs = yield song_1.default.find().select(displayFields);
            return res.json(songs);
        }
        catch (error) {
            const response = (0, errors_1.generateResponseClientError)(error, "Error retrieving songs: unknown error");
            return res.status(response.status).json(response.error);
        }
    });
}
exports.getSongs = getSongs;
function getSong(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            zodSchemas_1.mongodb_idSchema.parse(id);
            const song = yield songUtils.findById(id, displayFields, "song", "getSong");
            return res.json(song);
        }
        catch (error) {
            const response = (0, errors_1.generateResponseClientError)(error, "Error retrieving the song");
            return res.status(response.status).json(response.error);
        }
    });
}
exports.getSong = getSong;
function createSong(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            zodSchemas_1.createSongSchema.parse(req.body);
            const { name, accountId } = req.body;
            const genres = (0, utils_1.convertStrTolist)(req.body.genres);
            const artists = (0, utils_1.convertStrTolist)(req.body.artists);
            const albums = (0, utils_1.convertStrTolist)(req.body.albums);
            const files = req.files;
            // Validate if the files comply with the expected schema and are files
            (0, zodSchemas_1.validateReqFiles)(files, zodSchemas_1.Song_CreateReqFilesSchema, ["song", "cover"]);
            let newSong = new song_1.default({
                name,
                genres,
                artists,
                albums,
                accountId: accountId,
            });
            const song = files.song[0];
            (0, utils_1.ValidFileType)("audio", song, "song", "createSong");
            if (files["cover"]) {
                const cover = files.cover[0];
                (0, utils_1.ValidFileType)("image", cover, "cover", "createSong");
                const coverUploaded = yield storage.uploadFile(cover);
                newSong.cover = {
                    fileName: coverUploaded,
                    size: cover.size,
                    mimetype: cover.mimetype,
                };
            }
            const songUploaded = yield storage.uploadFile(song);
            newSong.songFile = {
                fileName: songUploaded,
                size: song.size,
                mimetype: song.mimetype,
            };
            newSong.save();
            const finalSong = yield songUtils.findById(newSong._id, displayFields, "song", "createSong");
            return res.json(finalSong);
        }
        catch (error) {
            if (error instanceof errors_1.UnknownError && error.action === "uploadFile") {
                return res.status(500).json({
                    message: "Error creating the song: unable to upload files due to unknown error",
                    errorCode: types_1.EerrorCodes.UnknownError,
                });
            }
            else {
                const response = (0, errors_1.generateResponseClientError)(error, "Error creating song");
                return res.status(response.status).json(response.error);
            }
        }
    });
}
exports.createSong = createSong;
function updateSong(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            zodSchemas_1.mongodb_idSchema.parse(id);
            zodSchemas_1.updateSongSchema.parse(req.body);
            const permittedFields = ["genres", "artists", "albums"];
            const fieldsToUpdate = (0, utils_1.filterFields)(req.body, permittedFields);
            // if the form is empty and the client doesn't provide any file or the file field is empty, then return error
            if ((!fieldsToUpdate || Object.keys(fieldsToUpdate).length === 0) &&
                (!req.files || Object.keys(req.files).length === 0)) {
                return res.status(400).json({
                    message: "Error updating song: At least one field must be provided to update or the name of the provided properties are invalid",
                    errorCode: types_1.EerrorCodes.ValidationDataError,
                });
            }
            const song = (yield songUtils.findById(id, undefined, "song", "updateSong"));
            const files = req.files;
            if (files["cover"]) {
                const cover = files.cover[0];
                // Check if cover is a valid file
                (0, zodSchemas_1.validateFile)(cover);
                (0, utils_1.ValidFileType)("image", cover, "cover", "updateSong");
                const coverUploaded = yield storage.uploadFile(cover);
                const oldCoverFileName = (_a = song.get("cover")) === null || _a === void 0 ? void 0 : _a.fileName;
                try {
                    yield storage.deleteFile(oldCoverFileName);
                }
                catch (error) {
                    if (!(error instanceof errors_1.UnknownError) &&
                        !(error instanceof errors_1.FileNotFoundError)) {
                        throw error;
                    }
                }
                fieldsToUpdate["cover"] = {
                    fileName: coverUploaded,
                    size: cover.size,
                    mimetype: cover.mimetype,
                };
            }
            const updatedSong = yield songUtils.findByIdAndUpdate(id, displayFields, "song", "updateSong", fieldsToUpdate, {
                new: true,
            });
            return res.json(updatedSong);
        }
        catch (error) {
            if (error instanceof errors_1.UnknownError && error.action === "uploadFile") {
                return res.status(500).json({
                    message: "Error updating song: unable to upload new cover due to unknown error",
                    errorCode: types_1.EerrorCodes.UnknownError,
                });
            }
            else {
                const response = (0, errors_1.generateResponseClientError)(error, "Error updating song");
                return res.status(response.status).json(response.error);
            }
        }
    });
}
exports.updateSong = updateSong;
function deleteSong(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            const song = (yield songUtils.findByIdAndDelete(id, undefined, "song", "deleteSong"));
            const songFileName = song.get("songFile").fileName;
            try {
                yield storage.deleteFile(songFileName);
            }
            catch (error) {
                if (!(error instanceof errors_1.UnknownError) &&
                    !(error instanceof errors_1.FileNotFoundError)) {
                    throw error;
                }
            }
            const coverFileName = (_a = song.get("cover")) === null || _a === void 0 ? void 0 : _a.fileName;
            try {
                yield storage.deleteFile(coverFileName);
            }
            catch (error) {
                if (!(error instanceof errors_1.UnknownError) &&
                    !(error instanceof errors_1.FileNotFoundError)) {
                    throw error;
                }
            }
            const songFilter = songUtils.filterDocument(song, displayFields);
            return res.json(songFilter);
        }
        catch (error) {
            const response = (0, errors_1.generateResponseClientError)(error, "Error deleting song");
            return res.status(response.status).json(response.error);
        }
    });
}
exports.deleteSong = deleteSong;
