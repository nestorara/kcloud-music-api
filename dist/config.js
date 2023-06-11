"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODE_ENV = exports.SHARED_MUSIC = exports.MAXFILESIZE = exports.DB_PASSWORD = exports.DB_USER = exports.DB_DATABASE = exports.DB_HOST = exports.BUCKET_ENDPOINT = exports.BUCKET_REGION = exports.BUCKET_ACCESS_KEY = exports.BUCKET_SECRET_KEY = exports.BUCKET_NAME = exports.PORT = void 0;
require("dotenv/config");
const utils_1 = require("./utils");
exports.PORT = Number(process.env.PORT) || 3000;
exports.BUCKET_NAME = process.env.BUCKET_NAME;
exports.BUCKET_SECRET_KEY = process.env.BUCKET_SECRET_KEY;
exports.BUCKET_ACCESS_KEY = process.env.BUCKET_ACCESS_KEY;
exports.BUCKET_REGION = process.env.BUCKET_REGION;
exports.BUCKET_ENDPOINT = process.env.BUCKET_ENDPOINT;
exports.DB_HOST = process.env.DB_HOST;
exports.DB_DATABASE = process.env.DB_DATABASE;
exports.DB_USER = process.env.DB_USER;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
exports.MAXFILESIZE = Number(process.env.MAXFILESIZE) || 2 * 1024 * 1024 * 1024; // 2 GiB in bytes
exports.SHARED_MUSIC = process.env.SHARED_MUSIC
    ? (0, utils_1.strToBoolean)(process.env.SHARED_MUSIC)
    : false;
exports.NODE_ENV = process.env.NODE_ENV || "production";
