"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
require("./db");
const utils_1 = require("./utils");
(0, utils_1.checkRequiredEnvVariables)();
app_1.default.set("port", config_1.PORT);
app_1.default.listen(app_1.default.get("port"), () => {
    console.log("Running app on port", app_1.default.get("port"));
});
