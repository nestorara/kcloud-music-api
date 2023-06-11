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
exports.pathNotFound = exports.downloadFile = exports.getFileURL = exports.manageIdRequiredInRoutes = void 0;
const types_1 = require("../types");
const zodSchemas_1 = require("../zodSchemas");
const utils_1 = require("../utils");
const s3_1 = __importDefault(require("../libs/s3"));
const errors_1 = require("../libs/errors");
const storage = new s3_1.default();
// To manage routes that specifically need an id
function manageIdRequiredInRoutes(req, res) {
    res.status(400).json({
        message: "The id parameter is required",
        errorCode: types_1.EerrorCodes.MissingParameterError,
    });
}
exports.manageIdRequiredInRoutes = manageIdRequiredInRoutes;
/* Get url for the file in storage service.
   Note: hiddenName is the name to show to the user
   to hidden the real resource name*/
function getFileURL(model, resourceName, hiddenName) {
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const resourceNameToShow = hiddenName !== null && hiddenName !== void 0 ? hiddenName : resourceName;
            const { id } = req.params;
            zodSchemas_1.mongodb_idSchema.parse(id);
            // Object to work with the collection corresponding to the model
            const collectionUtils = new utils_1.modelUtils(model);
            const resource = (yield collectionUtils.findById(id, undefined, resourceName, "getFileURL"));
            const fileName = (_a = resource.get(resourceName)) === null || _a === void 0 ? void 0 : _a.fileName;
            if (typeof fileName !== "undefined") {
                const url = yield storage.getFileURL(fileName, undefined, resourceNameToShow);
                return res.json({ url });
            }
            else {
                return res.status(404).json({
                    message: `Error generating url: ${resourceNameToShow} not assigned`,
                    resource: resourceNameToShow,
                    errorCode: types_1.EerrorCodes.EmptyResourceError,
                });
            }
        }
        catch (error) {
            const response = (0, errors_1.generateResponseClientError)(error, "Error generating url");
            return res.status(response.status).json(response.error);
        }
    });
}
exports.getFileURL = getFileURL;
// Download the file from the storage server retrieved from the database
function downloadFile(model, resourceName, hiddenName) {
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const resourceNameToShow = hiddenName !== null && hiddenName !== void 0 ? hiddenName : resourceName;
            const { id } = req.params;
            zodSchemas_1.mongodb_idSchema.parse(id);
            // Object to work with the collection corresponding to the model
            const collectionUtils = new utils_1.modelUtils(model);
            const resource = (yield collectionUtils.findById(id, undefined, resourceName, "downloadFile"));
            const fileName = (_a = resource.get(resourceName)) === null || _a === void 0 ? void 0 : _a.fileName;
            if (typeof fileName !== "undefined") {
                const mimetype = (_b = resource.get(resourceName)) === null || _b === void 0 ? void 0 : _b.mimetype;
                const { fileData } = yield storage.downloadFile(fileName, resourceNameToShow);
                const extension = (0, utils_1.getExtensionOfMimetype)(mimetype)[0];
                const resourceDBName = resource.get("name");
                res.attachment(`${resourceDBName}.${extension}`);
                fileData.pipe(res);
            }
            else {
                return res.status(404).json({
                    message: `Error downloading file: ${resourceNameToShow} not assigned`,
                    resource: resourceNameToShow,
                    errorCode: types_1.EerrorCodes.EmptyResourceError,
                });
            }
        }
        catch (error) {
            const response = (0, errors_1.generateResponseClientError)(error, "Error downloading file");
            return res.status(response.status).json(response.error);
        }
    });
}
exports.downloadFile = downloadFile;
function pathNotFound(req, res) {
    return res.status(404).json({
        message: "Path not found: error 404",
        errorCode: types_1.EerrorCodes.PathNotFound,
    });
}
exports.pathNotFound = pathNotFound;
