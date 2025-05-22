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
const upload_1 = require("./functions/upload");
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
require("dotenv/config");
const STORAGE_URL = process.env.STORAGE_URL || "";
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(process.cwd(), "public")));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Hanya menerima file PNG dan JPEG."));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});
app.post("/upload", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).json({
            status: false,
            code: 400,
            message: "Tidak ada foto yang di upload"
        });
    }
    else {
        const buffer = req.file.buffer;
        const commit = new upload_1.Commit();
        const response = yield commit.push(buffer);
        res.status(response.status ? 200 : 500).json(response);
    }
}));
app.get("/file/:fileid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const fileId = (_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.fileid;
    if (!fileId) {
        res.status(404).json({
            status: false,
            code: 404,
            message: "Not Found"
        });
    }
    else {
        const response = yield fetch(STORAGE_URL + fileId);
        if (!(response === null || response === void 0 ? void 0 : response.ok)) {
            res.status(404).json({
                status: false,
                code: 404,
                message: "Not Found"
            });
        }
        else {
            const image = yield response.arrayBuffer();
            const buffer = Buffer.from(image);
            res.send(buffer);
        }
    }
}));
app.use((req, res, next) => {
    res.status(404).json({
        status: false,
        code: 404,
        message: "Not Found"
    });
});
app.listen(8000, () => {
    console.log("App is running...");
});
