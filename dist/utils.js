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
exports.checkRequiredEnvVariables = exports.ValidFileType = exports.getExtensionOfMimetype = exports.timeout = exports.modelUtils = exports.filterFields = exports.strToBoolean = exports.convertStrTolist = void 0;
const errors_1 = require("./libs/errors");
const types_1 = require("./types");
const path_1 = __importDefault(require("path"));
// Converts string to list based on delimiter
function convertStrTolist(stringToConvert, delimiter = ",") {
    if (stringToConvert) {
        const list = stringToConvert.trim().split(delimiter);
        list.forEach((element, i) => {
            list[i] = element.trim();
        });
        return list;
    }
    return [];
}
exports.convertStrTolist = convertStrTolist;
function strToBoolean(str) {
    if (str && str.trim().toLocaleLowerCase() === "true") {
        return true;
    }
    else {
        return false;
    }
}
exports.strToBoolean = strToBoolean;
// Filter the fields of the request according to a whitelist
function filterFields(fields, permittedFields) {
    const filteredFields = {};
    Object.keys(fields).forEach((field) => {
        if (permittedFields.includes(field)) {
            filteredFields[field] = fields[field];
        }
    });
    return filteredFields;
}
exports.filterFields = filterFields;
// Implements extra functionality to the database operations
class modelUtils {
    constructor(model) {
        this.model = model;
    }
    filterDocument(document, permittedFields) {
        const documentObject = document.toObject();
        const filteredDocument = {};
        permittedFields.forEach((field) => {
            if (documentObject[field]) {
                filteredDocument[field] = documentObject[field];
            }
        });
        return filteredDocument;
    }
    /* Generate an error when the resource does not exist
       for the findById function
       or any other function that finds the resource before executing other actions,
       and additionally filter the fields. */
    findByIdOperations(id, operation, permittedFields, resourceName, action = "findByIdOperations", ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const resource = yield operation(id, ...args);
            if (!resource) {
                throw new errors_1.ResourceNotFoundError("Error finding resource: resource doesn't exist", resourceName, action);
            }
            else if (permittedFields) {
                return this.filterDocument(resource, permittedFields);
            }
            else {
                return resource;
            }
        });
    }
    findById(id, permittedFields, resourceName, action = "findById", ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findByIdOperations(id, this.model.findById.bind(this.model), permittedFields, resourceName, action, ...args);
        });
    }
    findByIdAndUpdate(id, permittedFields, resourceName, action = "findByIdAndUpdate", ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findByIdOperations(id, this.model.findByIdAndUpdate.bind(this.model), permittedFields, resourceName, action, ...args);
        });
    }
    findByIdAndDelete(id, permittedFields, resourceName, action = "findByIdAndDelete", ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findByIdOperations(id, this.model.findByIdAndDelete.bind(this.model), permittedFields, resourceName, action, ...args);
        });
    }
}
exports.modelUtils = modelUtils;
// Adds a time to an operation, when the time runs out, returns an error, because it has taken too long to complete
function timeout(time, command, resourceName, action = "timeout", ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield Promise.race([
            command(...args),
            new Promise((_, reject) => {
                setTimeout(() => reject(new errors_1.TimeoutError("Operation expired, because it has taken too long to respond", resourceName, action)), time);
            }),
        ]);
        return result;
    });
}
exports.timeout = timeout;
function getExtensionOfMimetype(mimetype) {
    if (mimetype === "audio/wave") {
        return ["wav", "wave"];
    }
    else if (mimetype === "audio/webm") {
        return ["webm"];
    }
    else if (mimetype === "audio/ogg") {
        return ["ogg"];
    }
    else if (mimetype === "audio/mpeg") {
        return ["mp3"];
    }
    else if (mimetype === "audio/mp4") {
        return ["m4a", "mp4"];
    }
    else if (mimetype === "image/gif") {
        return ["gif"];
    }
    else if (mimetype === "image/jpeg") {
        return ["jpeg", "jpg"];
    }
    else if (mimetype === "image/svg+xml") {
        return ["svg"];
    }
    else if (mimetype === "image/webp") {
        return ["webp"];
    }
    else if (mimetype === "image/png") {
        return ["png"];
    }
    else {
        return ["unknow"];
    }
}
exports.getExtensionOfMimetype = getExtensionOfMimetype;
// Validates if file has valid format expected
function ValidFileType(type, file, resourceName, action = "ValidFileType") {
    const fileExtension = path_1.default.extname(file.originalname).slice(1);
    const supportedExtension = getExtensionOfMimetype(file.mimetype).includes(fileExtension);
    if (type === "audio" &&
        types_1.supportedAudioMimetypes.includes(file.mimetype) &&
        supportedExtension) {
        return true;
    }
    else if (type === "image" &&
        types_1.supportedImageMimetypes.includes(file.mimetype) &&
        supportedExtension) {
        return true;
    }
    else {
        throw new errors_1.UnsupportedFileTypeError("Error validating file type: unssupported file type or invalid file", resourceName, action);
    }
}
exports.ValidFileType = ValidFileType;
function checkRequiredEnvVariables() {
    const missingsEnv = types_1.requiredENV.filter((env) => typeof process.env[env] === "undefined");
    if (missingsEnv.length > 0) {
        console.error("Error to run the api server because some env variables not have been defined, required env: ", missingsEnv);
        process.exit(1);
    }
}
exports.checkRequiredEnvVariables = checkRequiredEnvVariables;
