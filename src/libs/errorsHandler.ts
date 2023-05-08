import { IResult } from "../types_and_interfaces";

export const errorCodes = {
  // If all goes well
  none: 0,
  // When an unknow error ocurrs
  unknown: 1,
  // If the content returned from object storage is not a Redable Stream (ej: a blob object or string)
  notIsaRedable: 2,
  // If the S3 service IP can not be ontenined (DNS error)
  S3ServiceNotFound: 3,
  // If the s3 service is not running or is in an error states
  S3ServiceNotAvailable: 4
};

export function handleS3Error(error: any): IResult {
  console.log(error)
  if (error.code == "ENOTFOUND") {
    return {
      success: false,
      message: "Error occurred while processing the request: Storage service not found",
      errorCode: errorCodes.S3ServiceNotAvailable,
    };
  }
  else if (error.code == "ECONNREFUSED") {
    return {
      success: false,
      message: "Error occurred while processing the request: Storage service not available",
      errorCode: errorCodes.S3ServiceNotAvailable,
    };
  }
  else {
    return {
      success: false,
      message: "An unknown error occurred while processing the request",
      errorCode: errorCodes.unknown,
    };
  }
}