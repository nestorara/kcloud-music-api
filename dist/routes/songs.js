"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SongsController = __importStar(require("../controllers/SongsController"));
const HandleUploadError_1 = __importDefault(require("../middlewares/HandleUploadError"));
const GenericController = __importStar(require("../controllers/GenericController"));
const song_1 = __importDefault(require("../models/song"));
const disabledFunctionalitie_1 = __importDefault(require("../middlewares/disabledFunctionalitie"));
const router = (0, express_1.Router)();
router.get("/getURL/songFile/:id", (0, disabledFunctionalitie_1.default)("SHARED_MUSIC"), GenericController.getFileURL(song_1.default, "songFile"));
router.get("/getURL/songFile", (0, disabledFunctionalitie_1.default)("SHARED_MUSIC"), GenericController.manageIdRequiredInRoutes);
router.get("/getURL/cover/:id", (0, disabledFunctionalitie_1.default)("SHARED_MUSIC"), GenericController.getFileURL(song_1.default, "cover"));
router.get("/getURL/cover", (0, disabledFunctionalitie_1.default)("SHARED_MUSIC"), GenericController.manageIdRequiredInRoutes);
router.get("/download/songFile/:id", GenericController.downloadFile(song_1.default, "songFile"));
router.get("/download/songFile", GenericController.manageIdRequiredInRoutes);
router.get("/download/cover/:id", GenericController.downloadFile(song_1.default, "cover"));
router.get("/download/cover", GenericController.manageIdRequiredInRoutes);
router.get("/:id", SongsController.getSong);
router.get("/", SongsController.getSongs);
router.post("/", (0, HandleUploadError_1.default)([
    { name: "cover", maxCount: 1 },
    { name: "song", maxCount: 1 },
]), SongsController.createSong);
router.patch("/:id", (0, HandleUploadError_1.default)([{ name: "cover", maxCount: 1 }]), SongsController.updateSong);
router.delete("/:id", SongsController.deleteSong);
exports.default = router;
