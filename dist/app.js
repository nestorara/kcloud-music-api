"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const songs_1 = __importDefault(require("./routes/songs"));
const generic_1 = __importDefault(require("./routes/generic"));
const checkDBStatus_1 = __importDefault(require("./middlewares/checkDBStatus"));
const HandleExpressErrors_1 = __importDefault(require("./middlewares/HandleExpressErrors"));
const config_1 = require("./config");
const app = (0, express_1.default)();
// middlewares before processing request
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// middlewares used only in development
if (config_1.NODE_ENV === "dev") {
    app.use((0, morgan_1.default)("combined"));
}
app.use(checkDBStatus_1.default);
// routes
app.use("/songs", songs_1.default);
app.use(generic_1.default);
// middlewares after processing request
app.use(HandleExpressErrors_1.default);
exports.default = app;
