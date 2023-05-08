import path from "path";

import S3Storage from "./libs/s3";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { BUCKET_NAME } from "./config";

export function convertStrTolist(
  stringToConvert: string,
  delimiter?: string
): string[] {
  const list: string[] = stringToConvert.trim().split(delimiter ?? ",");

  list.forEach((element, i) => {
    list[i] = element.trim();
  });

  return list;
}

export function getFileType(filename: string) {
  const extension = path.extname(filename);

  if (extension === ".mp3") {
    return "audio/mpeg";
  } else if (extension === ".wav") {
    return "audio/wav";
  } else if (extension === ".ogg") {
    return "audio/ogg";
  }
}

export function createMongooseSelectObject(permittedFileds: string[]) {
  return permittedFileds.reduce((obj, field) => ({ ...obj, [field]: 1 }), {});
}

export async function checkS3ServiceStatus() {
  try {
    const storage = new S3Storage();

    await storage.client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));

    // if service is availble return true
    return true;
  } catch {
    // if an unknow error occured, return false
    return false;
  }
}
