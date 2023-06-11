"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const types_1 = require("../types");
function checkDBStatus(req, res, next) {
    if (mongoose_1.connection.readyState === 1) {
        next();
    }
    else if (mongoose_1.connection.readyState === 2) {
        return res.status(503).json({
            message: "Error processing request: connection to database in progress",
            errorCode: types_1.EerrorCodes.DBConnectionInProgressError,
        });
    }
    else {
        return res.status(500).json({
            message: "Error processing request: database not available",
            errorCode: types_1.EerrorCodes.DBConnectionError,
        });
    }
}
exports.default = checkDBStatus;
