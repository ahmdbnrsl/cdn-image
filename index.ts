import { Commit } from "./functions/upload";
import * as fs from "fs";
import path from "path";
import exp from "express";
import multer from "multer";
import "dotenv/config";

const STORAGE_URL = process.env.STORAGE_URL || "";

const app = exp();
app.use(exp.static(path.join(process.cwd(), "public")));

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Hanya menerima file PNG dan JPEG."));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

app.post("/upload", upload.single("image"), async (req, res) => {
    if (!req.file) {
        res.status(400).json({
            status: false,
            code: 400,
            message: "Tidak ada foto yang di upload"
        });
    } else {
        const buffer = req.file.buffer;
        const commit = new Commit();
        const response = await commit.push(buffer);
        res.status(response.status ? 200 : 500).json(response);
    }
});

app.get("/file/:fileid", async (req, res) => {
    const fileId = req?.params?.fileid;
    if (!fileId) {
        res.status(404).json({
            status: false,
            code: 404,
            message: "Not Found"
        });
    } else {
        const response = await fetch(STORAGE_URL + fileId);

        if (!response?.ok) {
            res.status(404).json({
                status: false,
                code: 404,
                message: "Not Found"
            });
        } else {
            const image = await response.arrayBuffer();
            const buffer = Buffer.from(image);
            res.send(buffer);
        }
    }
});

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
