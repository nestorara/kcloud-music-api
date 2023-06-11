import "dotenv/config";
import { strToBoolean } from "./utils";

export const PORT = Number(process.env.PORT) || 3000;
export const BUCKET_NAME = process.env.BUCKET_NAME as string;
export const BUCKET_SECRET_KEY = process.env.BUCKET_SECRET_KEY as string;
export const BUCKET_ACCESS_KEY = process.env.BUCKET_ACCESS_KEY as string;
export const BUCKET_REGION = process.env.BUCKET_REGION as string;
export const BUCKET_ENDPOINT = process.env.BUCKET_ENDPOINT as string;
export const DB_HOST = process.env.DB_HOST as string;
export const DB_PORT = Number(process.env.DB_PORT) || 27017;
export const DB_DATABASE = process.env.DB_DATABASE as string || "songs";
export const DB_USER = process.env.DB_USER as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const MAXFILESIZE =
  Number(process.env.MAXFILESIZE) || 2 * 1024 * 1024 * 1024; // 2 GiB in bytes
export const SHARED_MUSIC = process.env.SHARED_MUSIC
  ? strToBoolean(process.env.SHARED_MUSIC)
  : false;
export const NODE_ENV = process.env.NODE_ENV || "production";