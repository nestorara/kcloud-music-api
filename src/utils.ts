import { Document, Model } from "mongoose";
import {
  ResourceNotFoundError,
  TimeoutError,
  UnsupportedFileTypeError,
} from "./libs/errors";
import {
  IRequestFile,
  requiredENV,
  supportedAudioMimetypes,
  supportedImageMimetypes,
} from "./types";
import path from "path";

// Converts string to list based on delimiter
export function convertStrTolist(
  stringToConvert: string | undefined,
  delimiter: string = ","
): string[] {
  if (stringToConvert) {
    const list: string[] = stringToConvert.trim().split(delimiter);

    list.forEach((element, i) => {
      list[i] = element.trim();
    });

    return list;
  }

  return [];
}

export function strToBoolean(str: string | undefined): boolean {
  if (str && str.trim().toLocaleLowerCase() === "true") {
    return true;
  } else {
    return false;
  }
}

// Filter the fields of the request according to a whitelist
export function filterFields(
  fields: object,
  permittedFields: string[]
): Record<string, any> {
  const filteredFields: Record<string, any> = {};

  Object.keys(fields).forEach((field) => {
    if (permittedFields.includes(field)) {
      filteredFields[field] = (fields as any)[field];
    }
  });

  return filteredFields;
}

// Implements extra functionality to the database operations
export class modelUtils<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  filterDocument(document: T, permittedFields: string[]): Partial<T> {
    const documentObject = document.toObject();

    const filteredDocument: Partial<T> = {};

    permittedFields.forEach((field) => {
      if (documentObject[field]) {
        filteredDocument[field as keyof T] = documentObject[field];
      }
    });

    return filteredDocument;
  }

  /* Generate an error when the resource does not exist
     for the findById function
     or any other function that finds the resource before executing other actions,
     and additionally filter the fields. */
  private async findByIdOperations(
    id: string,
    operation: (id: string, ...args: any[]) => Promise<T | null>,
    permittedFields?: string[],
    resourceName?: string,
    action: string = "findByIdOperations",
    ...args: any[]
  ): Promise<T | Partial<T>> {
    const resource = await operation(id, ...args);

    if (!resource) {
      throw new ResourceNotFoundError(
        "Error finding resource: resource doesn't exist",
        resourceName,
        action
      );
    } else if (permittedFields) {
      return this.filterDocument(resource, permittedFields);
    } else {
      return resource;
    }
  }

  async findById(
    id: string,
    permittedFields?: string[],
    resourceName?: string,
    action: string = "findById",
    ...args: any[]
  ): Promise<T | Partial<T>> {
    return await this.findByIdOperations(
      id,
      this.model.findById.bind(this.model),
      permittedFields,
      resourceName,
      action,
      ...args
    );
  }

  async findByIdAndUpdate(
    id: string,
    permittedFields?: string[],
    resourceName?: string,
    action: string = "findByIdAndUpdate",
    ...args: any[]
  ): Promise<T | Partial<T>> {
    return await this.findByIdOperations(
      id,
      this.model.findByIdAndUpdate.bind(this.model),
      permittedFields,
      resourceName,
      action,
      ...args
    );
  }

  async findByIdAndDelete(
    id: string,
    permittedFields?: string[],
    resourceName?: string,
    action: string = "findByIdAndDelete",
    ...args: any[]
  ): Promise<T | Partial<T>> {
    return await this.findByIdOperations(
      id,
      this.model.findByIdAndDelete.bind(this.model),
      permittedFields,
      resourceName,
      action,
      ...args
    );
  }
}

// Adds a time to an operation, when the time runs out, returns an error, because it has taken too long to complete
export async function timeout(
  time: number,
  command: Function,
  resourceName?: string,
  action: string = "timeout",
  ...args: any[]
): Promise<any> {
  const result = await Promise.race([
    command(...args),
    new Promise<void>((_, reject) => {
      setTimeout(
        () =>
          reject(
            new TimeoutError(
              "Operation expired, because it has taken too long to respond",
              resourceName,
              action
            )
          ),
        time
      );
    }),
  ]);

  return result;
}

export function getExtensionOfMimetype(mimetype: string): string[] {
  if (mimetype === "audio/wave") {
    return ["wav", "wave"];
  } else if (mimetype === "audio/webm") {
    return ["webm"];
  } else if (mimetype === "audio/ogg") {
    return ["ogg"];
  } else if (mimetype === "audio/mpeg") {
    return ["mp3"];
  } else if (mimetype === "audio/mp4") {
    return ["m4a", "mp4"];
  } else if (mimetype === "image/gif") {
    return ["gif"];
  } else if (mimetype === "image/jpeg") {
    return ["jpeg", "jpg"];
  } else if (mimetype === "image/svg+xml") {
    return ["svg"];
  } else if (mimetype === "image/webp") {
    return ["webp"];
  } else if (mimetype === "image/png") {
    return ["png"];
  } else {
    return ["unknow"];
  }
}

// Validates if file has valid format expected
export function ValidFileType(
  type: string,
  file: IRequestFile,
  resourceName?: string,
  action: string = "ValidFileType"
): boolean {
  const fileExtension = path.extname(file.originalname).slice(1);
  const supportedExtension = getExtensionOfMimetype(file.mimetype).includes(
    fileExtension
  );
  if (
    type === "audio" &&
    supportedAudioMimetypes.includes(file.mimetype) &&
    supportedExtension
  ) {
    return true;
  } else if (
    type === "image" &&
    supportedImageMimetypes.includes(file.mimetype) &&
    supportedExtension
  ) {
    return true;
  } else {
    throw new UnsupportedFileTypeError(
      "Error validating file type: unssupported file type or invalid file",
      resourceName,
      action
    );
  }
}

export function checkRequiredEnvVariables() {
  const missingsEnv = requiredENV.filter((env) => typeof process.env[env] === "undefined")
  
  if (missingsEnv.length > 0) {
    console.error("Error to run the api server because some env variables not have been defined, required env: ", missingsEnv)
    process.exit(1)
  }
}