import { ZodError, z } from "zod";
import { isValidObjectId } from "mongoose";

import { IRequestFiles } from "./types";

export const songSchema = z
  .object({
    name: z
      .string({
        required_error: "The name field is required",
        invalid_type_error:
          "The name field must be a string and not appear more than 1 time",
      })
      .nonempty("The name of the song cannot be empty"),
    genres: z
      .string({
        invalid_type_error:
          "The genre field must be a string with the genres of the song separated by a comma",
      })
      .nonempty("If the genres field is specified, it cannot be empty")
      .optional(),
    artists: z
      .string({
        invalid_type_error:
          "The artists field must be a string with the artists of the song separated by a comma",
      })
      .nonempty("If the artists field is specified, it cannot be empty")
      .optional(),
    albums: z
      .string({
        invalid_type_error:
          "The albums field must be a string with the albums to which the song belongs separated by a comma",
      })
      .nonempty("If the albums field is specified, it cannot be empty"),
    accountId: z
      .string({
        required_error: "The accountId field is required",
        invalid_type_error:
          "The accountId field must be a string and not appear more than 1 time",
      })
      .nonempty(
        "The accoundId of the account associated to the song cannot be empty"
      ),
  })
  .partial();

export const createSongSchema = songSchema.required({
  name: true,
  accountId: true,
});

// Copy of the original songSchema without the accountId property, because it cannot be updated
export const updateSongSchema = songSchema.omit({ accountId: true });

// Schema for ObjectIds of mongodb database
export const mongodb_idSchema = z
  .string()
  .refine((value) => isValidObjectId(value), {
    message: "The id provided is invalid",
  });

export const fileSchema = z.object({
  fieldname: z.string().nonempty(),
  originalname: z.string().nonempty(),
  encoding: z.string().nonempty(),
  mimetype: z.string().nonempty(),
  size: z.number().gt(0),
  buffer: z.unknown().refine((value) => {
    if (value && Buffer.isBuffer(value) && value.length !== 0) {
      return true;
    }

    return false;
  }),
});

export const Song_ReqFilesSchema = z
  .object({
    song: z.array(fileSchema).length(1),
    cover: z.array(fileSchema).length(1),
  })
  .partial();

export const Song_CreateReqFilesSchema = Song_ReqFilesSchema.required({
  song: true,
});

// Validate if is a file and customize errors
export const validateFile = (file: any) => {
  const result = fileSchema.safeParse(file);

  if (!result.success) {
    result.error.issues.find((issue) => {
      if (
        issue.code === z.ZodIssueCode.invalid_type &&
        issue.received === "undefined"
      ) {
        throw new ZodError([
          {
            code: z.ZodIssueCode.custom,
            message: "The file is required",
            path: [],
          },
        ]);
      } else {
        throw new ZodError([
          {
            code: z.ZodIssueCode.custom,
            message: "The file provided is invalid",
            path: [],
          },
        ]);
      }
    });
  } else {
    return file;
  }
};

// Validate if the req.files comply with the schema and the fields are files
export const validateReqFiles = (
  RequestFile: IRequestFiles,
  shema: z.ZodSchema<any>,
  fields: string[]
) => {
  const result = shema.safeParse(RequestFile);

  let issues: Record<string, ZodError> = {};

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const fieldName = issue.path[0].toString();

      if (fields.includes(fieldName) && !issues[fieldName]) {
        if (
          issue.code === z.ZodIssueCode.invalid_type &&
          issue.received === "undefined"
        ) {
          issues[fieldName] = new ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: `The ${fieldName} file is required`,
              path: [fieldName],
            },
          ]);
        } else {
          issues[fieldName] = new ZodError([
            {
              code: z.ZodIssueCode.custom,
              message: `The ${fieldName} file is invalid`,
              path: [fieldName],
            },
          ]);
        }
      }
    });

    const errors = Object.values(issues);

    throw new ZodError(errors.flatMap((error) => error.issues));
  } else {
    return RequestFile;
  }
};
