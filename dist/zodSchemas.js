"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReqFiles = exports.validateFile = exports.Song_CreateReqFilesSchema = exports.Song_ReqFilesSchema = exports.fileSchema = exports.mongodb_idSchema = exports.updateSongSchema = exports.createSongSchema = exports.songSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
exports.songSchema = zod_1.z
    .object({
    name: zod_1.z
        .string({
        required_error: "The name field is required",
        invalid_type_error: "The name field must be a string and not appear more than 1 time",
    })
        .nonempty("The name of the song cannot be empty"),
    genres: zod_1.z
        .string({
        invalid_type_error: "The genre field must be a string with the genres of the song separated by a comma",
    })
        .nonempty("If the genres field is specified, it cannot be empty")
        .optional(),
    artists: zod_1.z
        .string({
        invalid_type_error: "The artists field must be a string with the artists of the song separated by a comma",
    })
        .nonempty("If the artists field is specified, it cannot be empty")
        .optional(),
    albums: zod_1.z
        .string({
        invalid_type_error: "The albums field must be a string with the albums to which the song belongs separated by a comma",
    })
        .nonempty("If the albums field is specified, it cannot be empty"),
    accountId: zod_1.z
        .string({
        required_error: "The accountId field is required",
        invalid_type_error: "The accountId field must be a string and not appear more than 1 time",
    })
        .nonempty("The accoundId of the account associated to the song cannot be empty"),
})
    .partial();
exports.createSongSchema = exports.songSchema.required({
    name: true,
    accountId: true,
});
// Copy of the original songSchema without the accountId property, because it cannot be updated
exports.updateSongSchema = exports.songSchema.omit({ accountId: true });
// Schema for ObjectIds of mongodb database
exports.mongodb_idSchema = zod_1.z
    .string()
    .refine((value) => (0, mongoose_1.isValidObjectId)(value), {
    message: "The id provided is invalid",
});
exports.fileSchema = zod_1.z.object({
    fieldname: zod_1.z.string().nonempty(),
    originalname: zod_1.z.string().nonempty(),
    encoding: zod_1.z.string().nonempty(),
    mimetype: zod_1.z.string().nonempty(),
    size: zod_1.z.number().gt(0),
    buffer: zod_1.z.unknown().refine((value) => {
        if (value && Buffer.isBuffer(value) && value.length !== 0) {
            return true;
        }
        return false;
    }),
});
exports.Song_ReqFilesSchema = zod_1.z
    .object({
    song: zod_1.z.array(exports.fileSchema).length(1),
    cover: zod_1.z.array(exports.fileSchema).length(1),
})
    .partial();
exports.Song_CreateReqFilesSchema = exports.Song_ReqFilesSchema.required({
    song: true,
});
// Validate if is a file and customize errors
const validateFile = (file) => {
    const result = exports.fileSchema.safeParse(file);
    if (!result.success) {
        result.error.issues.find((issue) => {
            if (issue.code === zod_1.z.ZodIssueCode.invalid_type &&
                issue.received === "undefined") {
                throw new zod_1.ZodError([
                    {
                        code: zod_1.z.ZodIssueCode.custom,
                        message: "The file is required",
                        path: [],
                    },
                ]);
            }
            else {
                throw new zod_1.ZodError([
                    {
                        code: zod_1.z.ZodIssueCode.custom,
                        message: "The file provided is invalid",
                        path: [],
                    },
                ]);
            }
        });
    }
    else {
        return file;
    }
};
exports.validateFile = validateFile;
// Validate if the req.files comply with the schema and the fields are files
const validateReqFiles = (RequestFile, shema, fields) => {
    const result = shema.safeParse(RequestFile);
    let issues = {};
    if (!result.success) {
        result.error.issues.forEach((issue) => {
            const fieldName = issue.path[0].toString();
            if (fields.includes(fieldName) && !issues[fieldName]) {
                if (issue.code === zod_1.z.ZodIssueCode.invalid_type &&
                    issue.received === "undefined") {
                    issues[fieldName] = new zod_1.ZodError([
                        {
                            code: zod_1.z.ZodIssueCode.custom,
                            message: `The ${fieldName} file is required`,
                            path: [fieldName],
                        },
                    ]);
                }
                else {
                    issues[fieldName] = new zod_1.ZodError([
                        {
                            code: zod_1.z.ZodIssueCode.custom,
                            message: `The ${fieldName} file is invalid`,
                            path: [fieldName],
                        },
                    ]);
                }
            }
        });
        const errors = Object.values(issues);
        throw new zod_1.ZodError(errors.flatMap((error) => error.issues));
    }
    else {
        return RequestFile;
    }
};
exports.validateReqFiles = validateReqFiles;
