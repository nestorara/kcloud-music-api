"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
function HandleExpressErrors(error, req, res, next) {
    console.error(error);
    res.status(500).json({
        message: "Error processing request: unknown error",
        errorCode: types_1.EerrorCodes.UnknownError,
    });
}
exports.default = HandleExpressErrors;
