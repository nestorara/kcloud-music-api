"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GenericController_1 = require("../controllers/GenericController");
const router = (0, express_1.Router)();
router.all("*", GenericController_1.pathNotFound);
exports.default = router;
